import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { ProductForm } from '@/components/studio/ProductForm';

export default async function NewProductPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('type', 'product') // Filter for product categories ONLY
    .order('name');

  return (
    <div>
        <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">New Product</h1>
            <p className="text-slate-500">Add a new item to your store.</p>
        </div>
        <ProductForm categories={categories || []} />
    </div>
  );
}
