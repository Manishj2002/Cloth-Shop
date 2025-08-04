'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import Link from 'next/link';

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session) {
      const fetchUser = async () => {
        const res = await fetch('/api/users/me');
        const data = await res.json();
        setUser(data);
      };
      fetchUser();
    }
  }, [session, status, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select an image');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/users/profile-picture', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setUser({ ...user, profilePicture: data.profilePicture });
        setError('');
        setFile(null);
      } else {
        setError(data.message || 'Failed to upload profile picture');
      }
    } catch (err) {
      setError('Failed to upload profile picture');
    }
  };

  if (status === 'loading' || !user) return <div>Loading...</div>;

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
            <h1 className="text-3xl font-heading text-primary-darkgreen mb-4">My Profile</h1>
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-shrink-0">
                <Image
                  src={user.profilePicture || '/placeholder.jpg'}
                  alt="Profile Picture"
                  width={150}
                  height={150}
                  className="rounded-full object-cover"
                />
                <div className="mt-4">
                  <Label htmlFor="profile-picture" className="text-primary-darkgreen">Upload New Picture</Label>
                  <Input
                    id="profile-picture"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="border-accent-beige mt-2"
                  />
                  {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                  <Button
                    onClick={handleUpload}
                    className="mt-2 bg-primary-darkgreen text-base-white hover:bg-primary-navy"
                    disabled={!file}
                  >
                    Upload
                  </Button>
                </div>
              </div>
              <div className="flex-grow">
                <h2 className="text-xl font-body text-primary-darkgreen">Name: {user.name}</h2>
                <p className="text-gray-600 mt-2">Email: {user.email}</p>
                <p className="text-gray-600 mt-2">Role: {user.role}</p>
                <p className="text-gray-600 mt-2">Verified: {user.isVerified ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}