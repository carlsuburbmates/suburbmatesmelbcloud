import { createClient } from '@/utils/supabase/server';

export type AuditAction =
    | 'APPROVE_LISTING'
    | 'FLAG_LISTING'
    | 'BAN_USER'
    | 'UNBAN_USER'
    | 'DELIST_USER'
    | 'UNDELIST_USER'
    | 'EVICT_USER'
    | 'VERIFY_ABN_SUCCESS'
    | 'VERIFY_ABN_FAILURE'
    | 'QUOTA_EXCEEDED_ERROR'
    | 'UPDATE_REPORT_STATUS';

export async function logAudit(params: {
    action: AuditAction;
    targetId?: string;
    targetType?: 'listing' | 'user' | 'product' | 'report';
    metadata?: any;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        console.error('Audit Log Attempted without authenticated user');
        return;
    }

    const { error } = await supabase
        .from('audit_logs')
        .insert({
            actor_id: user.id,
            action: params.action,
            target_id: params.targetId,
            target_type: params.targetType,
            metadata: params.metadata || {}
        });

    if (error) {
        console.error('Failed to write audit log:', error);
    }
}
