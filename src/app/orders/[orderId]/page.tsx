import { Suspense } from 'react';
import OrderDetails from '@/components/OrderDetails';

export default function OrderDetailsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrderDetails />
    </Suspense>
  );
}
