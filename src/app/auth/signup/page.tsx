'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { AuthCard } from '@/components/auth/AuthCard';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthButton } from '@/components/auth/AuthButton';
import { SocialButton } from '@/components/auth/SocialButton';
import { ErrorMessage } from '@/components/auth/ErrorMessage';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message);
      }

      setSuccess('Registration successful! Please check your email to verify your account.');
      setEmail('');
      setPassword('');
      setName('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogleSignUp = async () => {
    await signIn('google', { callbackUrl: '/' });
  };

  return (
    <AuthCard title="Sign Up">
      <form onSubmit={handleSignUp} className="space-y-4">
        <AuthInput
          id="name"
          label="Name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          required
        />
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
        <ErrorMessage message={error} />
        {success && <p className="text-green-500 text-sm text-center">{success}</p>}
        <AuthButton label="Sign Up" />
      </form>
      <div className="mt-4 text-center">
        <p className="text-sm text-primary-darkgreen">Or sign up with</p>
        <SocialButton provider="Google" action="Sign up" onClick={handleGoogleSignUp} />
      </div>
    </AuthCard>
  );
}