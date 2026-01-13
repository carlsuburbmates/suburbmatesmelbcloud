'use client';

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Sparkles, X, ShieldCheck } from 'lucide-react';

interface BadgeExplanationProps {
  type: 'verified' | 'pro' | 'featured';
  onClose: () => void;
}

export function BadgeExplanation({ type, onClose }: BadgeExplanationProps) {
  const content = {
    verified: {
      title: 'Verified ABN',
      icon: <CheckCircle2 className="w-8 h-8 text-verified" />,
      description: 'This business has provided a valid Australian Business Number (ABN) which has been cross-referenced for authenticity.',
      benefit: 'Increased trust and credibility in the marketplace.'
    },
    pro: {
      title: 'Pro Studio',
      icon: <Sparkles className="w-8 h-8 text-gold" />,
      description: 'This creator has upgraded to a Pro Studio, gaining access to premium design tools, higher product limits, and advanced sharing features.',
      benefit: 'Committed to a premium customer experience.'
    },
    featured: {
      title: 'Featured Placement',
      icon: <ShieldCheck className="w-8 h-8 text-gold" />,
      description: 'This listing is part of a paid featured placement. Pro creators can boost their visibility within specific Council areas.',
      benefit: 'Priority ranking in search results.'
    }
  }[type];

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <Card className="w-full max-w-sm shadow-window overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="flex flex-row items-center justify-between border-b border-line pb-4">
          <CardTitle className="text-sm font-bold uppercase tracking-widest text-ink-muted">Trust Details</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="py-8 flex flex-col items-center text-center px-6">
          <div className="w-16 h-16 bg-canvas rounded-full flex items-center justify-center mb-6 shadow-sm border border-line">
            {content.icon}
          </div>
          <h3 className="text-xl font-bold text-ink mb-3">{content.title}</h3>
          <p className="text-sm text-ink-muted leading-relaxed mb-6">
            {content.description}
          </p>
          <div className="w-full p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs text-left">
            <strong className="text-ink block mb-1">Why this matters:</strong>
            <span className="text-ink-muted">{content.benefit}</span>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Button onClick={onClose} className="w-full bg-slate-900 text-white rounded-xl">
            Got it
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
