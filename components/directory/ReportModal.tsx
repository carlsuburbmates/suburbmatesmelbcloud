'use client';

import { useState } from 'react';
import { submitReport } from '@/app/actions/reports';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react';

interface ReportModalProps {
  listingId: string;
  listingName: string;
  onClose: () => void;
}

const REASONS = [
  'Incorrect Information',
  'Misleading Category',
  'Fraudulent Activity',
  'Inappropriate Content',
  'Other',
];

export function ReportModal({ listingId, listingName, onClose }: ReportModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    
    formData.append('listingId', listingId);
    const result = await submitReport(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      setTimeout(onClose, 2000);
    }
  }

  return (
    <div 
        role="dialog" 
        aria-modal="true"
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-ink/40 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <Card className="w-full max-w-lg shadow-window overflow-hidden animate-in zoom-in-95 duration-200">
        <CardHeader className="flex flex-row items-center justify-between border-b border-line bg-canvas/50">
          <CardTitle className="text-lg">Report Concern</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        {success ? (
          <div className="py-12 flex flex-col items-center text-center px-8">
            <div className="w-16 h-16 bg-verified/10 text-verified rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-ink">Report Received</h3>
            <p className="text-ink-muted mt-2">
              Our operators will investigate "{listingName}" based on your feedback.
            </p>
          </div>
        ) : (
          <form action={handleSubmit}>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-ink-muted uppercase tracking-widest">Reason for Report</label>
                <select 
                  name="reason" 
                  required 
                  className="w-full bg-canvas border border-line rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-ink focus:border-ink transition-all outline-none"
                >
                  <option value="">Select a reason...</option>
                  {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-ink-muted uppercase tracking-widest">Your Email</label>
                <Input name="reporterEmail" type="email" placeholder="Required for follow-up" required />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-ink-muted uppercase tracking-widest">Additional Details</label>
                <textarea 
                  name="details" 
                  rows={4}
                  placeholder="Tell us what's wrong..."
                  className="w-full bg-canvas border border-line rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-ink focus:border-ink transition-all outline-none"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm font-medium">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
            </CardContent>
            <CardFooter className="bg-canvas/50 border-t border-line flex gap-3 p-6">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="flex-grow">
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="flex-grow bg-ink text-white hover:bg-slate-800">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Submit Report
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}
