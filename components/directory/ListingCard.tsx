'use client';

import Link from 'next/link';
import { MapPin, Sparkles, Mail, Phone, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { ReportButton } from '@/components/listing/ReportButton';
import { BadgeExplanation } from './BadgeExplanation';

// Strict Contract:
// - Name (Bold)
// - Category (Subtle Tag)
// - Location (Start of card)
// - Badges: Verified (Blue Check), Pro (Gold Sparkles)
// - Description (Truncated)

interface ListingCardProps {
  id: string;
  name: string;
  description: string | null;
  category: string; // Display Name
  location: string;
  isVerified: boolean;
  tier: 'Basic' | 'Pro';
  featured?: boolean;
  status: 'claimed' | 'unclaimed'; // New Prop
  slug: string | null; // New Prop
  contact_email?: string | null;
  phone?: string | null;
}

export function ListingCard({
  id,
  name,
  description,
  location,
  isVerified,
  tier,
  featured,
  category,
  status,
  slug,
  contact_email,
  phone,
}: ListingCardProps) {
  
  // Routing Logic:
  // - Claimed: Go to Studio Page (/u/[slug])
  // - Unclaimed: Go to Claim Flow (/claim/[id]) - NEVER a detail page
  const href = (status === 'claimed' && slug) ? `/u/${slug}` : (status === 'claimed' ? `/listing/${id}` : `/claim/${id}`);
  const ctaText = status === 'claimed' ? 'View Studio' : 'Claim Profile';
  
  const [badgeDetail, setBadgeDetail] = useState<'verified' | 'pro' | 'featured' | null>(null);
  
  return (
    <>
      {badgeDetail && (
        <BadgeExplanation 
          type={badgeDetail} 
          onClose={() => setBadgeDetail(null)} 
        />
      )}
      <Link href={href} className={cn("group block h-full focus:outline-none", featured && "sm:col-span-2")}>
      <Card className={cn(
        "h-full flex flex-col transition-all duration-300 hover:shadow-pop hover:-translate-y-1 relative overflow-hidden bg-white shadow-window border-transparent",
        featured && "border-gold/40 bg-gold/5 shadow-floating scale-[1.02] min-h-[420px]",
        status === 'unclaimed' && "bg-canvas grayscale-[1] opacity-60 hover:opacity-100 hover:grayscale-0"
      )}>
        {featured && (
          <div 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setBadgeDetail('featured'); }}
            className="absolute top-0 right-0 bg-gold text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg z-10 uppercase tracking-wider cursor-help hover:bg-slate-900 transition-colors"
          >
            Featured
          </div>
        )}

        <CardContent className="p-5 flex-1 flex flex-col gap-3">
          {/* Header: Name + Badges */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="rounded-sm font-normal text-[10px] tracking-wide text-ink-muted bg-canvas">
                    {category}
                  </Badge>
                  {status === 'unclaimed' && (
                     <Badge variant="outline" className="rounded-sm font-normal text-[10px] lowercase text-ink-muted/50 border-ink/10">
                        Unclaimed
                     </Badge>
                  )}
                </div>
                
                <h3 className="line-clamp-1 text-xl font-medium text-ink group-hover:text-blue-600 transition-colors type-display leading-tight font-serif">
                    {name}
                </h3>
            </div>
            
            <div className="flex shrink-0 gap-1.5 pl-2">
              {isVerified && (
                <div 
                  title="Verified ABN" 
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setBadgeDetail('verified'); }}
                  className="cursor-help"
                >
                   <Badge variant="verified" className="h-6 w-6 p-0 flex items-center justify-center rounded-full hover:scale-110 transition-transform">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                   </Badge>
                </div>
              )}
              {tier === 'Pro' && (
                <div 
                  title="Pro Studio"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setBadgeDetail('pro'); }}
                  className="cursor-help"
                >
                   <Badge variant="premium" className="h-6 w-6 p-0 flex items-center justify-center rounded-full shadow-none bg-gold/10 text-gold hover:bg-gold/20 hover:scale-110 transition-transform">
                      <Sparkles className="h-3.5 w-3.5" />
                   </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs font-medium text-ink-muted/80 type-meta tracking-wider">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{location}</span>
          </div>

          {/* Description */}
          <p className="line-clamp-2 text-sm text-ink-muted leading-relaxed font-sans opacity-90">
            {description || 'No description provided.'}
          </p>
        </CardContent>

        {/* Footer: CTA + Quick Actions */}
        <CardFooter className="p-5 pt-0 mt-auto flex items-center justify-between border-t border-transparent group-hover:border-ink/5 transition-colors">
          <span className={cn(
            "text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1 type-meta",
            status === 'claimed' ? "text-ink group-hover:text-blue-600" : "text-ink-muted/60"
          )}>
            {ctaText} <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
          </span>

          {status === 'claimed' && (
            <div className="flex gap-2" onClick={(e) => e.preventDefault()}>
              <ReportButton 
                listingId={id} 
                listingName={name} 
                className="h-8 w-8 rounded-full text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                variant="ghost"
              />
               {contact_email && (
                 <a 
                  href={`mailto:${contact_email}`}
                  title="Send Email"
                  className="p-2 rounded-full bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors border border-slate-100"
                 >
                   <Mail className="h-3.5 w-3.5" />
                 </a>
               )}
               {phone && (
                 <a 
                  href={`tel:${phone.replace(/\s+/g, '')}`}
                  title="Call Business"
                  className="p-2 rounded-full bg-slate-50 text-slate-400 hover:bg-ink hover:text-white transition-colors border border-slate-100"
                 >
                   <Phone className="h-3.5 w-3.5" />
                 </a>
               )}
            </div>
          )}
        </CardFooter>
      </Card>
      </Link>
    </>
  );
}
