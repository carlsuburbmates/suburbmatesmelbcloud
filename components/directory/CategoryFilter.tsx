'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

interface CategoryFilterProps {
  categories: { id: string; name: string; type: string }[];
  basePath?: string;
}

export function CategoryFilter({ categories, basePath = '/directory' }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  if (!searchParams) return null;
  const currentCategory = searchParams.get('category');

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

  const handleCategoryChange = (category: string) => {
    // Toggle off if same
    const newValue = category === currentCategory ? null : category;
    router.push(`${basePath}?${createQueryString('category', newValue)}`);
  };

  return (
    <div className="space-y-4">
      <h3 className="type-meta text-xs font-bold uppercase tracking-widest text-ink/40 border-b border-ink/10 pb-2">Filter by Category</h3>
      <div className="flex flex-col space-y-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.name)}
            className={`text-left text-sm px-3 py-2 rounded-lg transition-all ${
              currentCategory === cat.name
                ? 'bg-ink text-white font-medium shadow-lg scale-[1.02]'
                : 'text-ink-muted hover:bg-ink/5 hover:text-ink font-medium'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>
      {currentCategory && (
         <button 
           onClick={() => router.push(basePath)}
           className="text-xs text-red-500 hover:text-red-600 font-medium pt-2 pl-3 flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity"
         >
           × Clear Filter
         </button>
      )}
    </div>
  );
}
