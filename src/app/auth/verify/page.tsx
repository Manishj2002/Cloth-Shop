'use client';

   import { useState, useEffect } from 'react';
   import { useRouter, useSearchParams } from 'next/navigation';
   import { AuthCard } from '@/components/auth/AuthCard';
   import { AuthButton } from '@/components/auth/AuthButton';
   import { ErrorMessage } from '@/components/auth/ErrorMessage';

   export default function VerifyEmail() {
     const [message, setMessage] = useState('');
     const [error, setError] = useState('');
     const router = useRouter();
     const searchParams = useSearchParams();
     const token = searchParams.get('token');

     useEffect(() => {
       if (token) {
         verifyEmail(token);
       } else {
         setError('Invalid or missing verification token');
       }
     }, [token]);

     const verifyEmail = async (token: string) => {
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

         setMessage('Email verified successfully! You can now sign in.');
       } catch (err: any) {
         setError(err.message);
       }
     };

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