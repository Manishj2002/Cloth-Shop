'use client';

   import { useState, useEffect } from 'react';
   import { useRouter, useSearchParams } from 'next/navigation';
   import { AuthCard } from '@/components/auth/AuthCard';
   import { AuthInput } from '@/components/auth/AuthInput';
   import { AuthButton } from '@/components/auth/AuthButton';
   import { ErrorMessage } from '@/components/auth/ErrorMessage';

   export default function ResetPassword() {
     const [password, setPassword] = useState('');
     const [confirmPassword, setConfirmPassword] = useState('');
     const [error, setError] = useState('');
     const [success, setSuccess] = useState('');
     const router = useRouter();
     const searchParams = useSearchParams();
     const token = searchParams.get('token');

     useEffect(() => {
       if (!token) {
         setError('Invalid or missing reset token');
       }
     }, [token]);

     const handleResetPassword = async (e: React.FormEvent) => {
       e.preventDefault();
       setError('');
       setSuccess('');

       if (password !== confirmPassword) {
         setError('Passwords do not match');
         return;
       }

       try {
         const res = await fetch('/api/auth/reset-password', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ token, password }),
         });

         if (!res.ok) {
           const data = await res.json();
           throw new Error(data.message);
         }

         setSuccess('Password reset successfully! You can now sign in.');
         setPassword('');
         setConfirmPassword('');
       } catch (err: any) {
         setError(err.message);
       }
     };

     return (
       <AuthCard title="Reset Password">
         <form onSubmit={handleResetPassword} className="space-y-4">
           <AuthInput
             id="password"
             label="New Password"
             type="password"
             value={password}
             onChange={(e) => setPassword(e.target.value)}
             placeholder="Enter new password"
             required
           />
           <AuthInput
             id="confirm-password"
             label="Confirm Password"
             type="password"
             value={confirmPassword}
             onChange={(e) => setConfirmPassword(e.target.value)}
             placeholder="Confirm new password"
             required
           />
           <ErrorMessage message={error} />
           {success && <p className="text-green-500 text-sm text-center">{success}</p>}
           <AuthButton label="Reset Password" />
           {(success || error) && (
             <AuthButton
               label="Go to Sign In"
               type="button"
               onClick={() => router.push('/auth/signin')}
             />
           )}
         </form>
       </AuthCard>
     );
   }