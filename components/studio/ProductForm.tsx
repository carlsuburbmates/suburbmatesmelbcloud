'use client';

import { useState } from 'react';
import { createProduct, updateProduct, deleteProduct } from '@/app/actions/products';
import { generateProductDescription } from '@/app/actions/ai';
import { Loader2, Trash2, Wand2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Category {
  id: string;
  name: string;
  type: string;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category_id: string;
  image_url: string | null;
  business_id?: string;
}

interface ProductFormProps {
  product?: Product; // If provided, edit mode
  categories: Category[];
}

export function ProductForm({ product, categories }: ProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const isEdit = !!product;

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const action = isEdit ? updateProduct : createProduct;
    if (isEdit && product) formData.append('id', product.id);

    const result = await action(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push('/studio/products');
      router.refresh();
    }
  }

  async function handleDelete() {
      if (!product || !confirm('Are you sure you want to delete this product?')) return;
      setLoading(true);
      const result = await deleteProduct(product.id);
      if (result?.error) {
          setError(result.error);
          setLoading(false);
      } else {
          router.push('/studio/products');
          router.refresh();
      }
  }

  async function handleMagicFill() {
      const nameInput = document.getElementById('name') as HTMLInputElement;
      const catInput = document.getElementById('category_id') as HTMLSelectElement;
      
      const name = nameInput?.value;
      const catName = catInput?.options[catInput.selectedIndex]?.text || 'General';

      if (!name) {
          setError('Please enter a product name first.');
          return;
      }

      setGenerating(true);
      setError(null); // Clear errors
      
      try {
        const description = await generateProductDescription(name, catName);
        const descInput = document.getElementById('description') as HTMLTextAreaElement;
        if (descInput) {
            descInput.value = description;
        }
      } catch (err) {
          setError('Failed to generate description.');
      } finally {
          setGenerating(false);
      }
  }

  return (
    <div className="bg-white rounded-3xl col-span-1 max-w-2xl mx-auto shadow-sm border border-slate-200 p-8">
      <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-100">
        <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{isEdit ? 'Edit Product' : 'New Product'}</h2>
            <p className="text-slate-500 text-sm mt-1">Define the details of your offering.</p>
        </div>
        {isEdit && (
            <button 
                type="button" 
                onClick={handleDelete}
                className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2.5 rounded-xl transition-all border border-transparent hover:border-red-100"
                title="Delete Product"
            >
                <Trash2 className="w-5 h-5" />
            </button>
        )}
      </div>
      
      <form action={handleSubmit} className="space-y-8">
        
        {/* Section 1: Essentials */}
        <div className="space-y-4">
           <div>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-700">Product/Service Name</label>
              <input
                type="text"
                name="name"
                id="name"
                defaultValue={product?.name}
                required
                placeholder="e.g. Premium Dog Walking (1 hr)"
                className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:border-slate-900 focus:ring-slate-900 sm:text-sm px-4 py-3 border transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="price" className="block text-sm font-semibold text-slate-700">Price (AUD)</label>
                    <div className="relative mt-1">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                        <input
                            type="number"
                            name="price"
                            id="price"
                            min="0"
                            step="0.01"
                            defaultValue={product?.price || 0}
                            required
                            className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-slate-900 focus:ring-slate-900 sm:text-sm pl-8 pr-4 py-3 border transition-all"
                        />
                    </div>
                </div>

                <div>
                  <label htmlFor="category_id" className="block text-sm font-semibold text-slate-700">Category</label>
                  <select
                    name="category_id"
                    id="category_id"
                    defaultValue={product?.category_id}
                    required
                    className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:border-slate-900 focus:ring-slate-900 sm:text-sm px-4 py-3 border transition-all"
                  >
                     <option value="">Select a category</option>
                     {categories.map((cat) => (
                       <option key={cat.id} value={cat.id}>
                         {cat.name}
                       </option>
                     ))}
                  </select>
                </div>
            </div>
        </div>

        {/* Section 2: Details */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
            <div>
              <div className="flex justify-between items-center mb-1">
                 <label htmlFor="description" className="block text-sm font-semibold text-slate-700">Public Description</label>
                 <button
                   type="button"
                   onClick={handleMagicFill}
                   disabled={generating}
                   className="text-[10px] flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-black uppercase tracking-widest bg-blue-50 px-2.5 py-1 rounded-full transition-all border border-blue-100"
                 >
                    {generating ? <Loader2 className="w-3 h-3 animate-spin"/> : <Wand2 className="w-3 h-3" />}
                    Magic Fill
                 </button>
              </div>
               <textarea
                name="description"
                id="description"
                rows={5}
                defaultValue={product?.description || ''}
                placeholder="Describe what customers get, duration, or any requirements..."
                className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:border-slate-900 focus:ring-slate-900 sm:text-sm px-4 py-3 border transition-all"
              />
            </div>

            <div>
               <label htmlFor="image_url" className="block text-sm font-semibold text-slate-700">Visual URL (Direct Link)</label>
               <input
                type="url"
                name="image_url"
                id="image_url"
                defaultValue={product?.image_url || ''}
                placeholder="https://images.unsplash.com/..."
                className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:border-slate-900 focus:ring-slate-900 sm:text-sm px-4 py-3 border transition-all"
              />
               <p className="mt-2 text-xs text-slate-400 italic">Pro Tip: Use high-quality images to increase conversion.</p>
            </div>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700 border border-red-100 font-medium">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end pt-6 gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center rounded-2xl bg-slate-900 px-10 py-4 font-bold text-white shadow-xl transition-all hover:bg-slate-800 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
          >
            {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            {isEdit ? 'Save Changes' : 'Create Product'}
          </button>
        </div>

      </form>
    </div>
  );
}
