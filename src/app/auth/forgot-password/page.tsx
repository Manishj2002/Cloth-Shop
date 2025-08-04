'use client';

   import { useState } from 'react';
   import { useRouter } from 'next/navigation';
   import { AuthCard } from '@/components/auth/AuthCard';
   import { AuthInput } from '@/components/auth/AuthInput';
   import { AuthButton } from '@/components/auth/AuthButton';
   import { ErrorMessage } from '@/components/auth/ErrorMessage';

   export default function ForgotPassword() {
     const [email, setEmail] = useState('');
     const [error, setError] = useState('');
     const [success, setSuccess] = useState('');
     const router = useRouter();

     const handleForgotPassword = async (e: React.FormEvent) => {
       e.preventDefault();
       setError('');
       setSuccess('');
       try {
         const res = await fetch('/api/auth/forgot-password', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ email }),
         });

         if (!res.ok) {
           const data = await res.json();
           throw new Error(data.message);
         }

         setSuccess('Password reset link sent! Please check your email.');
         setEmail('');
       } catch (err: any) {
         setError(err.message);
       }
     };

     return (
       <AuthCard title="Forgot Password">
         <form onSubmit={handleForgotPassword} className="space-y-4">
           <AuthInput
             id="email"
             label="Email"
             type="email"
             value={email}
             onChange={(e) => setEmail(e.target.value)}
             placeholder="Enter your email"
             required
           />
           <ErrorMessage message={error} />
           {success && <p className="text-green-500 text-sm text-center">{success}</p>}
           <AuthButton label="Send Reset Link" />
         </form>
       </AuthCard>
     );
   }