import { createClient } from '@/utils/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { ProductForm } from '@/components/studio/ProductForm';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditProductPage({ params: paramsPromise }: PageProps) {
  const params = await paramsPromise;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  // Fetch product AND check ownership via business_id -> listing -> owner_id
  // Or just fetch product and listing independently and check match.
  
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!product) notFound();

  // Check if user owns the business associated with this product
  const { data: listing } = await supabase
    .from('listings')
    .select('owner_id')
    .eq('id', product.listing_id) // listing_id on product
    .single();

  if (!listing || listing.owner_id !== user.id) {
      redirect('/studio/products?error=unauthorized');
  }

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('type', 'product')
    .order('name');

  return (
    <div>
        <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Edit Product</h1>
            <p className="text-slate-500">Update details for {product.name}.</p>
        </div>
        <ProductForm product={product as any} categories={categories || []} />
    </div>
  );
}
