import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, AlertCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function VerificationPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  const { data: listing } = await supabase
    .from('listings')
    .select('*')
    .eq('owner_id', user.id)
    .single();

  if (!listing) redirect('/studio');

  const isVerified = listing.verified;

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ink font-sans tracking-tight">Verification</h1>
        <p className="mt-2 text-lg text-ink-muted">
          Build trust with your customers by verifying your business identity.
        </p>
      </div>

      <div className="space-y-6">
        {/* Status Card */}
        <Card className={isVerified ? "bg-green-50 border-green-200" : ""}>
          <CardHeader>
            <div className="flex items-center gap-3">
               <ShieldCheck className={`w-8 h-8 ${isVerified ? "text-green-600" : "text-slate-400"}`} />
               <div>
                   <CardTitle className="text-xl">
                       {isVerified ? "You are Verified" : "Verification Required"}
                   </CardTitle>
                   <CardDescription className={isVerified ? "text-green-700" : ""}>
                       {isVerified 
                        ? "Your business has been verified. The badge is visible on your profile."
                        : "Submit your details to earn the Verified badge."}
                   </CardDescription>
               </div>
            </div>
          </CardHeader>
        </Card>

        {/* ABN Submission Form (Only if not verified) */}
        {!isVerified && (
            <Card>
                <CardHeader>
                    <CardTitle>Australian Business Number (ABN)</CardTitle>
                    <CardDescription>
                        We verify your ABN against the Australian Business Register. This is not public.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action="/api/studio/verification/submit-abn" method="POST" className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="abn" className="text-sm font-medium text-ink">ABN</label>
                            <Input 
                                id="abn" 
                                name="abn" 
                                placeholder="XX XXX XXX XXX" 
                                required 
                                pattern="[0-9\s]{11,14}"
                            />
                        </div>
                        <div className="bg-blue-50 p-4 rounded-md flex gap-3 items-start text-sm text-blue-800">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p>Manual verification may take up to 48 hours. Ensure your business name matches your listing name.</p>
                        </div>
                        <Button type="submit" className="w-full">Submit for Verification</Button>
                    </form>
                </CardContent>
            </Card>
        )}

        {/* Trust Signals Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
             <div className="p-6 bg-white border border-slate-200 rounded-xl">
                 <h3 className="font-bold text-ink mb-2">Why Verify?</h3>
                 <p className="text-sm text-ink-muted">Verified listings appear higher in search results and have a 3x higher conversion rate for enquiries.</p>
             </div>
             <div className="p-6 bg-white border border-slate-200 rounded-xl">
                 <h3 className="font-bold text-ink mb-2">Privacy</h3>
                 <p className="text-sm text-ink-muted">Your ABN and personal documents are stored securely and never shared with customers.</p>
             </div>
        </div>
      </div>
    </div>
  );
}
