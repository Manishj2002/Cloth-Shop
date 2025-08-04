import { Suspense } from 'react';
import VerifyClient from '@/components/VerifyClient';

export default function VerifyPage() {
  return (
    <Suspense fallback={<div>Verifying...</div>}>
      <VerifyClient />
    </Suspense>
  );
}
