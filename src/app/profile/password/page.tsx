'use client';

import { useState, ChangeEvent } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export default function ChangePassword() {
  const { status } = useSession();
  const router = useRouter();
  const [form, setForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (status === 'unauthenticated') {
    router.push('/auth/signin');
    return null;
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const { oldPassword, newPassword, confirmPassword } = form;

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('All fields are required');
      setSuccess('');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match');
      setSuccess('');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      setSuccess('');
      return;
    }

    try {
      const res = await fetch('/api/users/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newPassword, confirmPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Password updated successfully');
        setError('');
        setForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setError(data.message || 'Failed to update password');
        setSuccess('');
      }
    } catch {
      setError('Failed to update password');
      setSuccess('');
    }
  };

  return (
    <div className="container mx-auto p-4 flex flex-col md:flex-row gap-4">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5 }}
        className="md:w-1/4 bg-base-white p-4 rounded-lg md:sticky md:top-20"
      >
        <h2 className="text-xl font-heading text-primary-darkgreen mb-4">Profile Menu</h2>
        <nav className="space-y-2">
          <Link href="/profile" className="block text-primary-darkgreen hover:text-primary-navy py-2 px-4 rounded-md hover:bg-accent-beige">
            Profile
          </Link>
          <Link href="/profile/addresses" className="block text-primary-darkgreen hover:text-primary-navy py-2 px-4 rounded-md hover:bg-accent-beige">
            Manage Addresses
          </Link>
          <Link href="/profile/password" className="block text-primary-darkgreen hover:text-primary-navy py-2 px-4 rounded-md hover:bg-accent-beige">
            Change Password
          </Link>
        </nav>
      </motion.aside>

      {/* Main Content */}
      <div className="md:w-3/4">
        <Card className="bg-base-white border-accent-beige">
          <CardContent className="p-6">
            <h1 className="text-3xl font-heading text-primary-darkgreen mb-4">Change Password</h1>
            <div className="max-w-md">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="oldPassword">Old Password</Label>
                  <Input
                    id="oldPassword"
                    name="oldPassword"
                    type="password"
                    value={form.oldPassword}
                    onChange={handleInputChange}
                    className="border-accent-beige"
                  />
                </div>
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={form.newPassword}
                    onChange={handleInputChange}
                    className="border-accent-beige"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={form.confirmPassword}
                    onChange={handleInputChange}
                    className="border-accent-beige"
                  />
                </div>
              </div>

              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              {success && <p className="text-primary-darkgreen text-sm mt-2">{success}</p>}

              <Button
                onClick={handleSubmit}
                className="mt-4 bg-primary-darkgreen text-base-white hover:bg-primary-navy"
              >
                Update Password
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
