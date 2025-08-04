// app/products/[id]/page.tsx
import { Suspense } from 'react';
import ProductDetails from '@/components/ProductDetails';

export default function ProductPage() {
  return (
    <Suspense fallback={<div>Loading product...</div>}>
      <ProductDetails />
    </Suspense>
  );
}
