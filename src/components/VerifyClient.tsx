'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthCard } from '@/components/auth/AuthCard';
import { AuthButton } from '@/components/auth/AuthButton';
import { ErrorMessage } from '@/components/auth/ErrorMessage';

export default function VerifyEmailClient() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    const runVerification = async () => {
      if (!token) {
        setError('Missing verification token');
        return;
      }

      try {
        const res = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message);
        }

        setMessage('Email verified successfully! Redirecting...');
        setTimeout(() => {
          router.push('/auth/signin');
        }, 2000);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Something went wrong');
        }
      }
    };

    runVerification();
  }, [token, router]);

  return (
    <AuthCard title="Verify Email">
      {message && <p className="text-green-500 text-sm text-center">{message}</p>}
      <ErrorMessage message={error} />
      {(message || error) && (
        <AuthButton
          label="Go to Sign In"
          type="button"
          onClick={() => router.push('/auth/signin')}
        />
      )}
    </AuthCard>
  );
}
