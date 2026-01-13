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

    if (profile?.role !== 'operator') {
        throw new Error('Forbidden: Operator access required');
    }
    return user.id;
}

export async function updateReportStatus(reportId: string, status: 'investigating' | 'resolved' | 'dismissed', resolutionDetails?: string) {
    const actorId = await checkOperator();
    const supabase = await createClient();

    const { error } = await supabase
        .from('reports')
        .update({
            status,
            details: resolutionDetails ? resolutionDetails : undefined,
            updated_at: new Date().toISOString()
        })
        .eq('id', reportId);

    if (error) throw new Error(error.message);

    await logAudit({
        action: 'UPDATE_REPORT_STATUS',
        targetId: reportId,
        targetType: 'report',
        metadata: { status, resolutionDetails }
    });

    revalidatePath('/admin/reports');
}
