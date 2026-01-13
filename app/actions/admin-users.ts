'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { logAudit } from '@/lib/admin/audit';

async function checkOperator() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { data: profile } = await supabase
        .from('users_public')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!profile || profile.role !== 'operator') {
        throw new Error('Forbidden: Operator Access Only');
    }
    return supabase;
}

// ... imports
import { createAdminClient } from '@/utils/supabase/admin';
import { sendEnforcementSuspensionEmail, sendEnforcementEvictionEmail } from '@/lib/email';

// ... checkOperator ...

export async function toggleBanUser(userId: string, isSuspended: boolean) {
    const supabase = await checkOperator();
    const adminSupabase = createAdminClient();

    const { error } = await supabase
        .from('users_public')
        .update({
            is_suspended: isSuspended,
            suspended_until: isSuspended ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString() : null // 1 year ban default
        })
        .eq('id', userId);

    if (error) throw new Error(error.message);

    await logAudit({
        action: isSuspended ? 'BAN_USER' : 'UNBAN_USER',
        targetId: userId,
        targetType: 'user',
        metadata: { isSuspended }
    });


    // Notify User
    if (isSuspended) {
        const { data: userData } = await adminSupabase.auth.admin.getUserById(userId);
        if (userData?.user?.email) {
            // Provide a default reason for the system action
            const reason = "Violation of Platform Standards (Admin Action)";
            await sendEnforcementSuspensionEmail(userData.user.email, reason);
        }
    }

    revalidatePath('/admin/users');
}

export async function toggleDelistUser(userId: string, isDelisted: boolean) {
    const supabase = await checkOperator();

    const { error } = await supabase
        .from('users_public')
        .update({
            is_delisted: isDelisted
        })
        .eq('id', userId);

    if (error) throw new Error(error.message);

    await logAudit({
        action: isDelisted ? 'DELIST_USER' : 'UNDELIST_USER',
        targetId: userId,
        targetType: 'user',
        metadata: { isDelisted }
    });

    revalidatePath('/admin/users');
}

export async function evictUser(userId: string) {
    const supabase = await checkOperator();
    const adminSupabase = createAdminClient();

    // 1. Mark as Evicted
    const { error: updateError } = await supabase
        .from('users_public')
        .update({
            is_evicted: true,
            evicted_at: new Date().toISOString(),
            is_suspended: true, // Also suspend for good measure
            is_delisted: true   // Also delist
        })
        .eq('id', userId);

    if (updateError) throw new Error(updateError.message);

    // 2. Block Auth Access (Permanently)
    // Note: This disables the user in Supabase Auth
    const { error: authError } = await adminSupabase.auth.admin.updateUserById(userId, {
        ban_duration: 'none' // Effectively permanent disable
    });

    if (authError) throw new Error(authError.message);

    // 3. Send Eviction Notice (Final Email)
    const { data: userData } = await adminSupabase.auth.admin.getUserById(userId);
    if (userData?.user?.email) {
        await sendEnforcementEvictionEmail(userData.user.email, "Violation of Community Guidelines (Permanent Eviction)");
    }

    await logAudit({
        action: 'EVICT_USER',
        targetId: userId,
        targetType: 'user'
    });

    revalidatePath('/admin/users');
}
