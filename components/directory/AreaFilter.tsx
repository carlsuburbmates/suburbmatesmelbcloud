'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { COUNCILS, Council } from '@/lib/councils';

export function AreaFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  if (!searchParams) return null;
  const currentLocation = searchParams.get('location');

  // Group councils by Region for better UX
  const regions = useMemo(() => {
    const groups: Record<string, Council[]> = {};
    COUNCILS.forEach(c => {
        if (!groups[c.region]) groups[c.region] = [];
        groups[c.region].push(c);
    });
    return groups;
  }, []);

  const createQueryString = useCallback(
    (name: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  const handleAreaChange = (councilName: string) => {
    // Toggle off if same
    const newValue = councilName === currentLocation ? null : councilName;
    router.push(`/directory?${createQueryString('location', newValue)}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-baseline border-b pb-2">
         <h3 className="text-sm font-semibold text-slate-900">Browse by Area</h3>
         {currentLocation && (
             <button 
               onClick={() => router.push('/directory')}
               className="text-[10px] text-red-500 hover:text-red-700 font-medium uppercase tracking-wider"
             >
               Reset
             </button>
         )}
      </div>

      <div className="space-y-6">
        {Object.entries(regions).map(([regionName, councils]) => (
            <div key={regionName}>
                <h4 className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-3">{regionName}</h4>
                <div className="flex flex-col space-y-1">
                    {councils.map((council) => (
                    <button
                        key={council.name}
                        onClick={() => handleAreaChange(council.name)}
                        className={`text-left text-sm px-3 py-2 rounded-lg transition-colors leading-snug ${
                        currentLocation === council.name
                            ? 'bg-slate-900 text-white font-medium shadow-md'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                        title={council.name}
                    >
                        {council.friendlyName}
                    </button>
                    ))}
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}
