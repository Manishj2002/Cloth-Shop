'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthCard } from '@/components/auth/AuthCard';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthButton } from '@/components/auth/AuthButton';
import { SocialButton } from '@/components/auth/SocialButton';
import { ErrorMessage } from '@/components/auth/ErrorMessage';
import Link from 'next/link';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setError(result.error);
    } else {
      router.push('/');
    }
  };

  const handleGoogleSignIn = async () => {
    await signIn('google', { callbackUrl: '/' });
  };

  return (
    <AuthCard title="Sign In">
      <form onSubmit={handleEmailSignIn} className="space-y-4">
        <AuthInput
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />
        <AuthInput
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
        />
        <div className="text-sm text-right">
          <Link href="/auth/forgot-password" className="text-primary-darkgreen hover:underline">
            Forgot Password?
          </Link>
        </div>
        <ErrorMessage message={error} />
        <AuthButton label="Sign In" />
      </form>
      <div className="mt-4 text-center">
        <p className="text-sm text-primary-darkgreen">Or sign in with</p>
        <SocialButton provider="Google" onClick={handleGoogleSignIn} />
      </div>
    </AuthCard>
  );
}