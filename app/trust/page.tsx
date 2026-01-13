import Link from 'next/link';
import { ShieldCheck, UserCheck, Lock, Star } from 'lucide-react';

export default function TrustPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="bg-slate-900 text-white py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
            <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Trust & Safety</h1>
            <p className="text-xl text-slate-300">How we ensure SuburbMates remains a safe community for everyone.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-5xl space-y-16">
          
          {/* Verification */}
          <section className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 items-start">
             <div className="bg-blue-50 p-4 rounded-xl text-blue-600">
                <ShieldCheck className="w-12 h-12" />
             </div>
             <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Business Verification</h2>
                <p className="text-slate-600 leading-relaxed mb-6">
                    Every creator on SuburbMates undergoes a strict verification process. We validate Australian Business Numbers (ABN) directly against the Australian Business Register. 
                    Look for the blue checkmark to know you're dealing with a legitimate business.
                </p>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700 bg-slate-50 px-3 py-2 rounded-lg">
                        <UserCheck className="w-4 h-4 text-green-500" /> Identity Check
                    </div>
                     <div className="flex items-center gap-2 text-sm font-medium text-slate-700 bg-slate-50 px-3 py-2 rounded-lg">
                        <Lock className="w-4 h-4 text-green-500" /> Secure Data
                    </div>
                </div>
             </div>
          </section>

          {/* Standards */}
           <section className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Community Standards</h3>
                  <p className="text-slate-600">
                      We check content for safety and quality. Our triage system scans listings to ensure they meet our high standards for local services.
                  </p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Secure Payments</h3>
                  <p className="text-slate-600">
                      All payments are processed securely via Stripe. Your financial data never touches our servers directly.
                  </p>
              </div>
           </section>

           <div className="text-center">
               <p className="text-slate-500 mb-6">Have a concern about a listing?</p>
               <Link href="/contact" className="text-blue-600 font-bold hover:underline">Report an Issue &rarr;</Link>
           </div>
      </div>
    </main>
  );
}
