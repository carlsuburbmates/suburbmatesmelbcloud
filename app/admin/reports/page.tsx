import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, MoreHorizontal, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default async function ReportsPage() {
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

    const { data: reports, error } = await supabase
        .from('reports')
        .select(`
            *,
            listing:listings (
                id,
                name,
                slug
            )
        `)
        .order('created_at', { ascending: false });

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-black text-ink tracking-tight font-sans">
                    USER <span className="text-blue-600">REPORTS</span>
                </h1>
            </div>

            <Card className="border-line shadow-sm overflow-hidden bg-white/50 backdrop-blur-sm">
                <CardHeader className="bg-canvas border-b border-line">
                    <CardTitle className="text-sm font-bold uppercase tracking-widest text-ink-muted">Active Reports Portfolio</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-canvas hover:bg-canvas">
                                <TableHead className="font-bold text-ink uppercase text-[10px] tracking-widest">Date</TableHead>
                                <TableHead className="font-bold text-ink uppercase text-[10px] tracking-widest">Reporter</TableHead>
                                <TableHead className="font-bold text-ink uppercase text-[10px] tracking-widest">Listing</TableHead>
                                <TableHead className="font-bold text-ink uppercase text-[10px] tracking-widest">Reason</TableHead>
                                <TableHead className="font-bold text-ink uppercase text-[10px] tracking-widest">Status</TableHead>
                                <TableHead className="font-bold text-ink uppercase text-[10px] tracking-widest text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reports?.map((report: any) => (
                                <TableRow key={report.id} className="hover:bg-slate-50 transition-colors border-b border-line/50">
                                    <TableCell className="text-xs text-ink-muted">
                                        {format(new Date(report.created_at), 'dd MMM yyyy')}
                                    </TableCell>
                                    <TableCell className="text-xs font-medium text-ink">
                                        {report.reporter_email}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-ink">{report.listing?.name}</span>
                                            <Link href={`/u/${report.listing?.slug}`} target="_blank" className="text-slate-300 hover:text-blue-600 transition-colors">
                                                <ExternalLink className="w-3 h-3" />
                                            </Link>
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-[200px]">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-xs font-bold text-red-600">{report.reason}</span>
                                            <p className="text-[10px] text-ink-muted line-clamp-1">{report.details}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge 
                                            variant={report.status === 'pending' ? 'outline' : 'secondary'} 
                                            className={
                                                report.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                                                report.status === 'resolved' ? 'bg-green-50 text-green-700 border-green-200' : 
                                                'bg-slate-50 text-slate-600'
                                            }
                                        >
                                            {report.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {(!reports || reports.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-12 text-ink-muted">
                                        No reports found. All clear.
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
