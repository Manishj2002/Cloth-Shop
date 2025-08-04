'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export default function Addresses() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [newAddress, setNewAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    isDefault: false,
  });
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session) {
      const fetchAddresses = async () => {
        const res = await fetch('/api/addresses');
        const data = await res.json();
        setAddresses(data);
      };
      fetchAddresses();
    }
  }, [session, status, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (editingAddress) {
      setEditingAddress({ ...editingAddress, [name]: value });
    } else {
      setNewAddress({ ...newAddress, [name]: value });
    }
  };

  const handleAddAddress = async () => {
    if (!newAddress.street || !newAddress.city || !newAddress.state || !newAddress.zipCode || !newAddress.country) {
      setError('All fields are required');
      return;
    }
    try {
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAddress),
      });
      const data = await res.json();
      if (res.ok) {
        setAddresses([...addresses, data]);
        setNewAddress({ street: '', city: '', state: '', zipCode: '', country: '', isDefault: false });
        setError('');
      } else {
        setError(data.message || 'Failed to add address');
      }
    } catch (err) {
      setError('Failed to add address');
    }
  };

  const handleEditAddress = async () => {
    if (!editingAddress.street || !editingAddress.city || !editingAddress.state || !editingAddress.zipCode || !editingAddress.country) {
      setError('All fields are required');
      return;
    }
    try {
      const res = await fetch(`/api/addresses?id=${editingAddress._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingAddress),
      });
      const data = await res.json();
      if (res.ok) {
        setAddresses(addresses.map((addr) => (addr._id === editingAddress._id ? data : addr)));
        setEditingAddress(null);
        setError('');
      } else {
        setError(data.message || 'Failed to update address');
      }
    } catch (err) {
      setError('Failed to update address');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      const res = await fetch(`/api/addresses?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAddresses(addresses.filter((addr) => addr._id !== id));
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to delete address');
      }
    } catch (err) {
      setError('Failed to delete address');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const res = await fetch(`/api/addresses?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true }),
      });
      if (res.ok) {
        setAddresses(
          addresses.map((addr) =>
            addr._id === id ? { ...addr, isDefault: true } : { ...addr, isDefault: false }
          )
        );
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to set default address');
      }
    } catch (err) {
      setError('Failed to set default address');
    }
  };

  if (status === 'loading') return <div>Loading...</div>;

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
            <h1 className="text-3xl font-heading text-primary-darkgreen mb-4">Manage Addresses</h1>
            {/* Add/Edit Address Form */}
            <div className="mb-8">
              <h2 className="text-xl font-body text-primary-darkgreen mb-4">
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="street">Street</Label>
                  <Input
                    id="street"
                    name="street"
                    value={editingAddress ? editingAddress.street : newAddress.street}
                    onChange={handleInputChange}
                    className="border-accent-beige"
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    value={editingAddress ? editingAddress.city : newAddress.city}
                    onChange={handleInputChange}
                    className="border-accent-beige"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    name="state"
                    value={editingAddress ? editingAddress.state : newAddress.state}
                    onChange={handleInputChange}
                    className="border-accent-beige"
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode">Zip Code</Label>
                  <Input
                    id="zipCode"
                    name="zipCode"
                    value={editingAddress ? editingAddress.zipCode : newAddress.zipCode}
                    onChange={handleInputChange}
                    className="border-accent-beige"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    name="country"
                    value={editingAddress ? editingAddress.country : newAddress.country}
                    onChange={handleInputChange}
                    className="border-accent-beige"
                  />
                </div>
              </div>
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              <Button
                onClick={editingAddress ? handleEditAddress : handleAddAddress}
                className="mt-4 bg-primary-darkgreen text-base-white hover:bg-primary-navy"
              >
                {editingAddress ? 'Update Address' : 'Add Address'}
              </Button>
              {editingAddress && (
                <Button
                  variant="outline"
                  className="mt-4 ml-2 border-accent-beige text-primary-darkgreen hover:bg-accent-beige"
                  onClick={() => setEditingAddress(null)}
                >
                  Cancel
                </Button>
              )}
            </div>
            {/* Address List */}
            <h2 className="text-xl font-body text-primary-darkgreen mb-4">Your Addresses</h2>
            {addresses.length === 0 ? (
              <p className="text-gray-600">No addresses found.</p>
            ) : (
              <div className="space-y-4">
                {addresses.map((address) => (
                  <Card key={address._id} className="bg-base-white border-accent-beige">
                    <CardContent className="p-4 flex justify-between items-start">
                      <div>
                        <p className="text-primary-darkgreen">{address.street}</p>
                        <p className="text-gray-600">{address.city}, {address.state} {address.zipCode}</p>
                        <p className="text-gray-600">{address.country}</p>
                        {address.isDefault && (
                          <p className="text-primary-darkgreen font-bold">Default Address</p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          className="border-accent-beige text-primary-darkgreen hover:bg-accent-beige"
                          onClick={() => setEditingAddress(address)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleDeleteAddress(address._id)}
                        >
                          Delete
                        </Button>
                        {!address.isDefault && (
                          <Button
                            className="bg-primary-darkgreen text-base-white hover:bg-primary-navy"
                            onClick={() => handleSetDefault(address._id)}
                          >
                            Set Default
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}