'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-line bg-canvas/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
            <Link href="/" className="font-serif text-2xl font-bold text-ink tracking-tight">
              SuburbMates
            </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/directory" className="text-sm font-medium text-ink hover:text-ink-muted transition-colors">
            Directory
          </Link>
          <Link href="/pricing" className="text-sm font-medium text-ink hover:text-ink-muted transition-colors">
            Pricing
          </Link>
          <Link href="/about" className="text-sm font-medium text-ink hover:text-ink-muted transition-colors">
            About
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
           <Link href="/directory">
              <Button variant="ghost" size="icon" className="text-ink">
                <Search className="w-5 h-5" />
              </Button>
           </Link>
           <Link href="/auth/login" className="text-sm font-bold text-ink hover:underline">
             Sign In
           </Link>
           <Link href="/pricing">
             <Button className="bg-ink text-white hover:bg-ink-muted">
               List My Business
             </Button>
           </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center gap-4">
           <Link href="/directory">
              <Search className="w-5 h-5 text-ink" />
           </Link>
           <button onClick={() => setIsOpen(!isOpen)} className="text-ink">
             {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
           </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden border-t border-line bg-canvas p-4 space-y-4 shadow-window">
          <nav className="flex flex-col gap-4">
            <Link 
              href="/" 
              onClick={() => setIsOpen(false)}
              className="text-lg font-medium text-ink"
            >
              Home
            </Link>
            <Link 
              href="/directory" 
              onClick={() => setIsOpen(false)}
              className="text-lg font-medium text-ink"
            >
              Directory
            </Link>
            <Link 
              href="/pricing" 
              onClick={() => setIsOpen(false)}
              className="text-lg font-medium text-ink"
            >
              Pricing
            </Link>
            <Link 
              href="/about" 
              onClick={() => setIsOpen(false)}
              className="text-lg font-medium text-ink"
            >
              About
            </Link>
            <hr className="border-line" />
            <Link 
              href="/auth/login" 
              onClick={() => setIsOpen(false)}
              className="text-lg font-bold text-ink"
            >
              Sign In
            </Link>
            <Link 
              href="/pricing" 
              onClick={() => setIsOpen(false)}
            >
               <Button className="w-full bg-ink text-white">List My Business</Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
