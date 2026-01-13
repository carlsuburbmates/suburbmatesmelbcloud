import Link from 'next/link';
import { Check, Star, Zap, LayoutGrid, ShieldCheck } from 'lucide-react';
import { CheckoutButton } from '@/components/marketing/CheckoutButton';
import { createClient } from '@/utils/supabase/server';

export default async function PricingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isLoggedIn = !!user;

  // Placeholder for env var
  const PRO_PRICE = "price_pro_monthly"; 

  return (
    <main className="min-h-screen bg-canvas text-ink">
      <div className="container mx-auto px-4 py-24 max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 pb-8 border-b-2 border-ink">
            <h1 className="type-display text-5xl md:text-7xl font-medium text-ink tracking-tighter leading-none">
              Platform <br/>
              <span className="italic text-ink-muted">Services.</span>
            </h1>
            <p className="text-lg md:text-xl text-ink font-medium max-w-md mt-8 md:mt-0 leading-relaxed text-right">
              We bridge the gap. You keep the control.<br/>
              Two simple ways to amplify your digital presence.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 lg:gap-0 border border-ink bg-white">
             
             {/* Basic Plan */}
             <div className="p-8 lg:p-12 lg:border-r border-ink flex flex-col h-full bg-white relative group hover:bg-canvas transition-colors">
                <div className="mb-auto">
                    <span className="text-xs font-bold uppercase tracking-widest text-ink-muted mb-2 block">Entry Level</span>
                    <h3 className="text-3xl font-serif font-bold text-ink mb-4">Basic</h3>
                    <div className="flex items-baseline gap-1 my-6">
                        <span className="text-5xl font-medium text-ink">$0</span>
                    </div>
                    <p className="text-ink font-medium leading-relaxed mb-8">
                      For emerging creators establishing their local footprint.
                    </p>
                    
                    <ul className="space-y-4 mb-8 text-sm font-medium">
                        <li className="flex gap-3">
                            <span className="w-1.5 h-1.5 bg-ink rounded-full mt-2" />
                            <span>Standard Studio Profile</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="w-1.5 h-1.5 bg-ink rounded-full mt-2" />
                            <span>List up to 3 Digital Products</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="w-1.5 h-1.5 bg-ink rounded-full mt-2" />
                            <span>Secure Stripe Payments</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="w-1.5 h-1.5 bg-ink rounded-full mt-2" />
                            <span>Local Directory Search</span>
                        </li>
                    </ul>
                </div>

                <Link href={isLoggedIn ? "/studio/onboarding/new" : "/auth/register"} className="block w-full text-center py-4 border-2 border-ink text-ink font-bold uppercase tracking-wider hover:bg-ink hover:text-white transition-colors">
                    Join Directory
                </Link>
             </div>

             {/* Pro Plan */}
             <div className="p-8 lg:p-12 lg:border-r border-ink flex flex-col h-full bg-ink text-white relative">
                <div className="absolute top-0 right-0 bg-gold text-ink text-[10px] font-bold px-3 py-1 uppercase tracking-widest">
                    Recommended
                </div>

                <div className="mb-auto">
                    <span className="text-xs font-bold uppercase tracking-widest text-white/50 mb-2 block flex items-center gap-2">
                       <Zap className="w-3 h-3 text-gold" /> Level Up
                    </span>
                    <h3 className="text-3xl font-serif font-bold text-white mb-4">Pro</h3>
                    <div className="flex items-baseline gap-1 my-6">
                        <span className="text-5xl font-medium text-white">$20</span>
                        <span className="text-white/50 font-normal text-lg">/mo</span>
                    </div>
                    <p className="text-white/80 font-medium leading-relaxed mb-8">
                      The complete toolkit for serious digital sellers.
                    </p>

                    <ul className="space-y-4 mb-8 text-sm font-medium text-white/90">
                        <li className="flex gap-3 items-start">
                            <Check className="w-4 h-4 text-gold mt-0.5" />
                            <span>Pro Mini-site Mode (Custom Vibe)</span>
                        </li>
                        <li className="flex gap-3 items-start">
                            <Check className="w-4 h-4 text-gold mt-0.5" />
                            <span>List up to 10 Digital Products</span>
                        </li>
                        <li className="flex gap-3 items-start">
                            <Check className="w-4 h-4 text-gold mt-0.5" />
                            <span>Reduced Transaction Fees (6%)</span>
                        </li>
                        <li className="flex gap-3 items-start">
                            <Check className="w-4 h-4 text-gold mt-0.5" />
                            <span>Priority Search Ranking</span>
                        </li>
                        <li className="flex gap-3 items-start">
                            <Check className="w-4 h-4 text-gold mt-0.5" />
                            <span>Share Kit (QR & Deep Links)</span>
                        </li>
                    </ul>
                </div>

                <CheckoutButton priceId={PRO_PRICE} isLoggedIn={isLoggedIn} />
             </div>

             {/* Featured Add-on */}
             <div className="p-8 lg:p-12 flex flex-col h-full bg-canvas relative overflow-hidden">
                {/* Decorative Pattern */}
                <div className="absolute top-0 right-0 p-4 opacity-10">
                   <LayoutGrid className="w-24 h-24" />
                </div>

                <div className="mb-auto">
                    <span className="text-xs font-bold uppercase tracking-widest text-ink-muted mb-2 block flex items-center gap-2">
                       <Star className="w-3 h-3 text-ink" /> Add-on
                    </span>
                    <h3 className="text-3xl font-serif font-bold text-ink mb-4">Featured</h3>
                    <div className="flex items-baseline gap-1 my-6">
                        <span className="text-5xl font-medium text-ink">$15</span>
                        <span className="text-ink-muted font-normal text-lg">/30 days</span>
                    </div>
                    <p className="text-ink font-medium leading-relaxed mb-8">
                      Claim one of 5 scarce spots in your Council area.
                    </p>

                    <ul className="space-y-4 mb-8 text-sm font-medium">
                        <li className="flex gap-3 items-start">
                            <ShieldCheck className="w-4 h-4 text-ink mt-0.5" />
                            <span>Absolute Top Search Placement</span>
                        </li>
                        <li className="flex gap-3 items-start">
                            <ShieldCheck className="w-4 h-4 text-ink mt-0.5" />
                            <span>Double-Size "Hero" Card</span>
                        </li>
                        <li className="flex gap-3 items-start">
                            <ShieldCheck className="w-4 h-4 text-ink mt-0.5" />
                            <span>Visible across entire Council</span>
                        </li>
                        <li className="flex gap-3 items-start">
                            <ShieldCheck className="w-4 h-4 text-ink mt-0.5" />
                            <span>Non-recurring (Manual renewal)</span>
                        </li>
                    </ul>
                </div>

                <Link href="/studio/promote" className="block w-full text-center py-4 border-2 border-ink bg-white text-ink font-bold uppercase tracking-wider hover:bg-ink hover:text-white transition-colors">
                    Check Availability
                </Link>
             </div>
          </div>

          {/* Context Footer */}
          <div className="mt-16 text-center">
             <p className="text-ink-muted text-sm font-medium">
                Payments are securely processed via Stripe. <br/>
                We do not hold your funds. You are the merchant of record for your products.
             </p>
          </div>
      </div>
    </main>
  );
}
