import { ImageResponse } from 'next/og';
import { createClient } from '@/utils/supabase/server';

export const runtime = 'edge';

export const alt = 'Listing Preview';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = await paramsPromise;
  const supabase = await createClient();
  const { data: listing } = await supabase
    .from('listings')
    .select('name, category:categories(name)')
    .eq('id', params.id)
    .single();

  const name = (listing as any)?.name || 'SuburbMates Listing';
  const category = (listing as any)?.category?.name || 'Local Business';

  return new ImageResponse(
    (
      <div
        style={{
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {/* Logo Placeholder */}
            <div style={{ width: 80, height: 80, background: '#000', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: 'white', fontSize: 40, fontWeight: 'bold' }}>S</div>
            </div>
            <div style={{ fontSize: 60, fontWeight: 'bold', color: '#0f172a' }}>suburbmates</div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 60 }}>
            <div style={{ fontSize: 80, fontWeight: 'bold', color: '#000', marginBottom: 20, textAlign: 'center', maxWidth: 1000 }}>
                {name}
            </div>
            <div style={{ fontSize: 40, color: '#64748b', background: '#f1f5f9', padding: '10px 30px', borderRadius: 50 }}>
                {category}
            </div>
        </div>

        <div style={{ position: 'absolute', bottom: 40, color: '#94a3b8', fontSize: 30 }}>
            suburbmates.com.au/listing/{params.id}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
