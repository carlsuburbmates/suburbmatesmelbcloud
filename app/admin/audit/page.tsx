import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface AuditLog {
    id: string;
    actor_id: string;
    action: string;
    target_id: string;
    target_type: string;
    metadata: any;
    created_at: string;
    actor_email?: string;
}

export default async function AuditPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; action?: string }>;
}) {
    const { q, action } = await searchParams;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/auth/login');

    const { data: profile } = await supabase
        .from('users_public')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'operator') {
        notFound();
    }

    let query = supabase
        .from('audit_logs')
        .select(`
            *,
            actor:users_public!actor_id (
                email
            )
        `)
        .order('created_at', { ascending: false });

    if (q) {
        query = query.or(`target_id.ilike.%${q}%,target_type.ilike.%${q}%`);
    }

    if (action) {
        query = query.eq('action', action);
    }

    const { data: logs, error } = await query.limit(50);

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-black text-ink tracking-tight font-sans">
                    AUDIT <span className="text-blue-600">LOGS</span>
                </h1>
            </div>

            <Card className="border-line shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm">
                <CardHeader className="bg-canvas border-b border-line py-4">
                    <form className="flex gap-4">
                        <Input 
                            name="q" 
                            placeholder="Search ID or Type..." 
                            defaultValue={q}
                            className="max-w-xs bg-white rounded-xl"
                        />
                        <select 
                            name="action" 
                            className="bg-white border border-line rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-ink"
                            defaultValue={action}
                        >
                            <option value="">All Actions</option>
                            <option value="APPROVE_LISTING">Approve Listing</option>
                            <option value="FLAG_LISTING">Flag Listing</option>
                            <option value="BAN_USER">Ban User</option>
                            <option value="DELIST_USER">Delist User</option>
                            <option value="EVICT_USER">Evict User</option>
                            <option value="VERIFY_ABN_SUCCESS">ABN Success</option>
                            <option value="VERIFY_ABN_FAILURE">ABN Failure</option>
                        </select>
                        <button type="submit" className="px-4 py-2 bg-ink text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors">
                            Filter
                        </button>
                    </form>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-canvas hover:bg-canvas">
                                <TableHead className="font-bold text-ink uppercase text-[10px] tracking-widest">Time</TableHead>
                                <TableHead className="font-bold text-ink uppercase text-[10px] tracking-widest">Operator</TableHead>
                                <TableHead className="font-bold text-ink uppercase text-[10px] tracking-widest">Action</TableHead>
                                <TableHead className="font-bold text-ink uppercase text-[10px] tracking-widest">Target</TableHead>
                                <TableHead className="font-bold text-ink uppercase text-[10px] tracking-widest">Metadata</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs?.map((log: any) => (
                                <TableRow key={log.id} className="hover:bg-slate-50 transition-colors border-b border-line/50">
                                    <TableCell className="text-xs text-ink-muted">
                                        {format(new Date(log.created_at), 'dd MMM, HH:mm')}
                                    </TableCell>
                                    <TableCell className="text-xs font-semibold text-ink">
                                        {log.actor?.email || 'System'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-sm">
                                            {log.action.replace(/_/g, ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-xs font-mono text-slate-400">
                                        <div className="flex flex-col">
                                            <span>{log.target_type}</span>
                                            <span className="text-[10px] truncate max-w-[100px]">{log.target_id}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-xs text-ink-muted max-w-xs">
                                        <pre className="text-[10px] bg-slate-50 p-1.5 rounded-lg overflow-x-auto border border-line/30">
                                            {JSON.stringify(log.metadata, null, 2)}
                                        </pre>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {(!logs || logs.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-12 text-ink-muted">
                                        No audit entries found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
