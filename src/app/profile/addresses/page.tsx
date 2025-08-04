'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type Address = {
  _id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
};

type NewAddress = Omit<Address, '_id'>;

export default function Addresses() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [newAddress, setNewAddress] = useState<NewAddress>({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    isDefault: false,
  });

  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const res = await fetch('/api/address');
      const data: Address[] = await res.json();
      setAddresses(data);
    } catch (err) {
      console.error('Error fetching addresses:', err);
    }
  };

  const handleInputChange = (field: keyof NewAddress, value: string | boolean) => {
    if (editingAddress) {
      setEditingAddress({ ...editingAddress, [field]: value });
    } else {
      setNewAddress({ ...newAddress, [field]: value });
    }
  };

  const handleSubmit = async () => {
    const addressToSave = editingAddress || newAddress;

    try {
      const res = await fetch('/api/address', {
        method: editingAddress ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addressToSave),
      });

      const data = await res.json();

      if (res.ok) {
        setError('');
        setNewAddress({
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
          isDefault: false,
        });
        setEditingAddress(null);
        fetchAddresses();
      } else {
        setError(data?.message || 'Failed to save address');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError('An error occurred');
    }
  };

  const handleEdit = (address: Address) => {
    setEditingAddress({ ...address });
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/address?_id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchAddresses();
      } else {
        const data = await res.json();
        setError(data?.message || 'Failed to delete address');
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError('An error occurred');
    }
  };

  const currentAddress = editingAddress || newAddress;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Card>
        <CardContent className="p-4 space-y-2">
          <h2 className="text-lg font-semibold">
            {editingAddress ? 'Edit Address' : 'Add Address'}
          </h2>

          {['street', 'city', 'state', 'zipCode', 'country'].map((field) => (
            <input
              key={field}
              type="text"
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              className="w-full border p-2 rounded-md"
              value={(currentAddress as unknown as Record<string, string>)[field]}
              onChange={(e) => handleInputChange(field as keyof NewAddress, e.target.value)}
            />
          ))}

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={currentAddress.isDefault}
              onChange={(e) => handleInputChange('isDefault', e.target.checked)}
            />
            Set as default
          </label>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button onClick={handleSubmit}>
            {editingAddress ? 'Update Address' : 'Add Address'}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <h2 className="text-xl font-bold">Saved Addresses</h2>
        {addresses.length === 0 ? (
          <p className="text-sm text-gray-500">No addresses found.</p>
        ) : (
          addresses.map((address) => (
            <Card key={address._id}>
              <CardContent className="p-4">
                <p>{address.street}, {address.city}, {address.state}, {address.zipCode}, {address.country}</p>
                <p className="text-sm text-gray-500">
                  {address.isDefault ? '(Default Address)' : ''}
                </p>
                <div className="flex gap-2 mt-2">
                  <Button onClick={() => handleEdit(address)}>Edit</Button>
                  <Button variant="destructive" onClick={() => handleDelete(address._id)}>Delete</Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
