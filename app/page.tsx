import { Search, MapPin, Star, ArrowRight, Zap, Layers } from 'lucide-react';
import Link from 'next/link';
import { getCategories } from '@/lib/search';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const categories = await getCategories();
  // Filter for top-level business categories, prioritizing digital-focused ones if possible
  const displayCategories = categories.filter(c => c.type === 'business').slice(0, 8);

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-canvas text-ink">
      {/* Hero Section - Anti-AI / Brutalist / Editorial */}
      <section className="relative px-4 pt-24 pb-32 md:pt-40 md:pb-48 border-b border-line">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col items-start text-left space-y-8">
            <div className="inline-flex items-center gap-2 border border-ink px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-ink hover:text-white transition-colors cursor-default">
              <span className="w-2 h-2 rounded-full bg-verified"></span>
              Melbourne Only
            </div>
            
            <h1 className="type-display text-6xl md:text-8xl lg:text-9xl font-medium text-ink tracking-tighter leading-[0.9]">
              The directory for <br />
              <span className="italic text-ink-muted">digital creators.</span>
            </h1>
            
            <p className="type-meta text-sm md:text-lg text-ink max-w-2xl leading-relaxed font-normal normal-case tracking-normal mt-4">
              A curated platform for Melbourne's solo, upcoming, and veteran digital talent. 
              Be seen in your locality. Sell your digital products. Build real trust.
            </p>

            {/* Search Bar - High Contrast */}
            <div className="w-full max-w-2xl mt-12 relative group">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                <Search className="h-6 w-6 text-ink" />
              </div>
              <form action="/directory" method="get">
                <input
                  type="text"
                  name="q"
                  placeholder="Search for Notion templates, Ableton racks, 3D assets..."
                  className="w-full h-20 pl-16 pr-6 rounded-none border-2 border-ink bg-transparent text-ink placeholder:text-ink-muted/60 focus:outline-none focus:bg-white transition-all text-xl font-medium"
                />
              </form>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-6 text-sm font-medium">
              <span className="text-ink-muted">Trending:</span>
              <Link href="/directory?q=presets" className="text-ink hover:underline decoration-2 underline-offset-4">Lightroom Presets</Link>
              <Link href="/directory?q=templates" className="text-ink hover:underline decoration-2 underline-offset-4">Notion Templates</Link>
              <Link href="/directory?q=assets" className="text-ink hover:underline decoration-2 underline-offset-4">3D Assets</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Manifesto / Anti-AI Statement */}
      <section className="py-24 border-b border-line bg-white">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-16">
           <div>
              <h2 className="type-display text-4xl md:text-5xl text-ink mb-6">
                Designed for humans, <br/>
                <span className="text-ink-muted italic">not algorithms.</span>
              </h2>
           </div>
           <div className="space-y-6 text-lg text-ink font-medium leading-relaxed">
              <p>
                SuburbMates is strictly a directory and marketplace bridge. We do not sell your products; you do. 
                We provide the visibility, the verification, and the local context that global platforms ignore.
              </p>
              <p className="text-ink-muted">
                No AI-generated clutter. No "growth hacking" UI patterns. Just a clean, functional, and state-of-the-art platform 
                to showcase your work to Melbourne.
              </p>
           </div>
        </div>
      </section>

      {/* Categories Grid - Brutalist Lines */}
      <section className="bg-canvas">
        <div className="container mx-auto px-4 py-20">
          <div className="flex items-end justify-between mb-12 border-b-2 border-ink pb-4">
            <h2 className="type-display text-3xl md:text-4xl text-ink">Digital Disciplines</h2>
            <Link href="/directory" className="hidden md:flex items-center gap-2 text-sm font-bold text-ink hover:text-ink-muted transition-colors uppercase tracking-wider">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-l border-t border-line">
            {displayCategories.map((cat) => (
              <Link 
                key={cat.id} 
                href={`/directory?category=${cat.name}`}
                className="group p-8 border-r border-b border-line bg-canvas hover:bg-white transition-colors flex flex-col justify-between h-64"
              >
                <div className="w-10 h-10 rounded-full bg-ink/5 flex items-center justify-center group-hover:bg-ink group-hover:text-white transition-colors">
                   <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-ink mb-2">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-ink-muted uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
                    Browse Creators
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-12 md:hidden text-center">
             <Link href="/directory" className="inline-block border-b-2 border-ink pb-1 text-sm font-bold text-ink uppercase tracking-wider">
              View All Categories
            </Link>
          </div>
        </div>
      </section>

      {/* Value Prop / Call to Action */}
      <section className="py-32 bg-ink text-canvas relative overflow-hidden">
        {/* Abstract Background Element */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />

        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <span className="inline-block px-3 py-1 border border-gold text-gold text-xs font-bold uppercase tracking-widest rounded-full">
                For Digital Creators
              </span>
              <h2 className="type-display text-5xl md:text-7xl text-white tracking-tighter leading-none">
                Be seen in <br/>
                <span className="italic text-white/50">your city.</span>
              </h2>
              <p className="text-white/70 text-xl leading-relaxed max-w-md">
                Whether you're selling presets, templates, or offering digital services, 
                trust is built locally. Verify your status and join Melbourne's creative index.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 pt-8">
                <Link href="/pricing">
                  <Button className="w-full sm:w-auto bg-white text-ink hover:bg-canvas text-lg font-bold px-10 py-7 rounded-none border-2 border-transparent hover:border-white transition-all">
                    List My Digital Product
                  </Button>
                </Link>
                <Link href="/about">
                   <Button variant="outline" className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10 text-lg font-medium px-10 py-7 rounded-none">
                    Why SuburbMates?
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Visual: Featured Slot Preview */}
            <div className="relative">
               <div className="absolute -top-12 -left-12 text-white/10">
                  <Star className="w-64 h-64" />
               </div>
               <div className="relative bg-canvas p-8 border-2 border-gold shadow-[16px_16px_0px_0px_rgba(198,168,124,0.2)]">
                  <div className="flex justify-between items-start mb-6">
                     <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-ink rounded-full" />
                        <div>
                           <div className="text-ink font-bold text-lg">Alex Design</div>
                           <div className="text-ink-muted text-xs uppercase tracking-widest">Collingwood</div>
                        </div>
                     </div>
                     <div className="bg-gold text-ink text-[10px] font-bold px-2 py-1 uppercase tracking-widest">Featured</div>
                  </div>
                  <div className="space-y-4">
                     <div className="h-40 bg-ink/5 flex items-center justify-center text-ink-muted italic">
                        Digital Product Preview
                     </div>
                     <h3 className="text-2xl font-serif text-ink">Ultimate Freelance Dashboard</h3>
                     <p className="text-ink-muted text-sm">
                        The complete Notion system for managing clients, projects, and finances.
                     </p>
                     <div className="pt-4 flex items-center justify-between border-t border-line">
                        <span className="font-bold text-ink">$45.00</span>
                        <span className="text-xs text-ink-muted uppercase font-bold">Buy Now</span>
                     </div>
                  </div>
               </div>
               <p className="text-center text-white/40 text-xs mt-8 uppercase tracking-widest">
                  Example Featured Slot Placement
               </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Signals - Minimalist */}
      <section className="py-16 bg-white border-b border-line">
         <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-ink font-bold text-lg flex items-center gap-3">
               <MapPin className="w-6 h-6" /> 
               <span>Melbourne First</span>
            </div>
            <div className="hidden md:block w-px h-8 bg-line" />
            <div className="text-ink font-bold text-lg flex items-center gap-3">
               <div className="w-6 h-6 rounded-full border-2 border-ink flex items-center justify-center text-xs">✓</div>
               <span>Strictly Anti-AI Generated Content</span>
            </div>
            <div className="hidden md:block w-px h-8 bg-line" />
            <div className="text-ink font-bold text-lg flex items-center gap-3">
               <Zap className="w-6 h-6" />
               <span>Instant Digital Delivery</span>
            </div>
         </div>
      </section>
    </div>
  );
}
