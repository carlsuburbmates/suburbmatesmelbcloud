import Link from 'next/link';
import { Facebook, Instagram, Twitter } from 'lucide-react';

export function SiteFooter() {
  return (
    <footer className="bg-white border-t border-line py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="font-serif text-2xl font-bold text-ink tracking-tight">
              SuburbMates
            </Link>
            <p className="text-sm text-ink-muted leading-relaxed max-w-xs">
              The local directory for Melbourne creators. Discover, connect, and support local businesses in your council area.
            </p>
          </div>

          {/* Discover */}
          <div>
            <h3 className="font-bold text-ink mb-4">Discover</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/directory" className="text-ink-muted hover:text-ink">Browse Directory</Link></li>
              <li><Link href="/marketplace" className="text-ink-muted hover:text-ink">Marketplace</Link></li>
              <li><Link href="/articles" className="text-ink-muted hover:text-ink">Local Stories</Link></li>
            </ul>
          </div>

          {/* For Creators */}
          <div>
            <h3 className="font-bold text-ink mb-4">For Creators</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/pricing" className="text-ink-muted hover:text-ink">List Your Business</Link></li>
              <li><Link href="/auth/login" className="text-ink-muted hover:text-ink">Creator Studio</Link></li>
              <li><Link href="/studio/billing" className="text-ink-muted hover:text-ink">Billing</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold text-ink mb-4">Support</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/about" className="text-ink-muted hover:text-ink">About Us</Link></li>
              <li><Link href="/faq" className="text-ink-muted hover:text-ink">FAQ</Link></li>
              <li><Link href="/trust" className="text-ink-muted hover:text-ink">Trust & Safety</Link></li>
              <li><Link href="/legal/privacy" className="text-ink-muted hover:text-ink">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-line pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-ink-muted">
            &copy; {new Date().getFullYear()} SuburbMates Melbourne. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-ink-muted hover:text-ink"><Instagram className="w-5 h-5" /></a>
            <a href="#" className="text-ink-muted hover:text-ink"><Twitter className="w-5 h-5" /></a>
            <a href="#" className="text-ink-muted hover:text-ink"><Facebook className="w-5 h-5" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
