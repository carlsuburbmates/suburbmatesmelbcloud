import { MapPin } from 'lucide-react';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-canvas text-ink">
      <div className="container mx-auto px-4 py-24 max-w-4xl">
          <div className="mb-20 border-b-2 border-ink pb-12">
            <span className="text-ink font-bold tracking-widest text-xs uppercase mb-4 block">Our Mission</span>
            <h1 className="type-display text-5xl md:text-7xl font-medium text-ink tracking-tighter leading-[0.9]">
                To build the digital infrastructure for <br/>
                <span className="italic text-ink-muted">local creative economies.</span>
            </h1>
          </div>

          <div className="grid md:grid-cols-12 gap-12">
              <div className="md:col-span-4">
                  <div className="sticky top-24">
                      <p className="text-sm font-bold uppercase tracking-widest text-ink mb-2">The Philosophy</p>
                      <p className="text-sm text-ink-muted">Anti-AI Design. <br/>Human Curated. <br/>Locally Verified.</p>
                  </div>
              </div>

              <div className="md:col-span-8 prose prose-lg prose-slate max-w-none">
                  <p className="text-2xl leading-relaxed text-ink font-medium font-serif">
                      SuburbMates is not a "gig economy" app. We are a digital directory and marketplace bridge for Melbourne's solo creators.
                  </p>
                  
                  <p className="text-ink-muted">
                      In an era of AI-generated noise and global genericism, we are betting on the opposite: <strong>Local, Human, and Specific.</strong>
                  </p>

                  <div className="my-12 p-8 border border-ink bg-white relative">
                      <div className="absolute -top-3 -left-3 bg-ink text-white px-3 py-1 text-xs font-bold uppercase tracking-widest">
                          Core Principle
                      </div>
                      <h3 className="text-xl font-bold text-ink mt-2 mb-4">We Don't Sell Your Work. You Do.</h3>
                      <p className="text-base text-ink mb-0">
                          We provide the platform, the verification, and the audience. But we are not the merchant of record. 
                          We bridge the gap between you and your neighbour, allowing you to sell your digital assets (templates, presets, art) directly.
                      </p>
                  </div>

                  <h3 className="font-bold text-ink text-xl">The "Anti-AI" Design</h3>
                  <p className="text-ink-muted">
                      You won't find generic "SaaS illustrations" or AI-generated copy here. Our platform is designed to be functional, stark, and honest. 
                      It steps back so your work can step forward. We believe design should be intentional, not automated.
                  </p>

                  <h3 className="font-bold text-ink text-xl mt-8">Why Local Matters for Digital?</h3>
                  <p className="text-ink-muted">
                      Why does a digital creator need a local directory? Because trust is the new currency. 
                      When a client sees you are verified in <em>Brunswick</em> or <em>Richmond</em>, it creates a tangible connection that an anonymous profile cannot.
                  </p>

                  <div className="flex items-center gap-4 mt-12 pt-12 border-t border-line">
                      <div className="w-12 h-12 bg-ink text-white flex items-center justify-center rounded-full">
                          <MapPin className="w-6 h-6" />
                      </div>
                      <div>
                          <div className="font-bold text-ink">Born in Melbourne</div>
                          <div className="text-sm text-ink-muted">Proudly built and operated locally.</div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </main>
  );
}
