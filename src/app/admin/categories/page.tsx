'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminSidebar from '@/components/AdminSidebar';

// Define a type for your category
interface Category {
  _id: string;
  name: string;
  description: string;
}

export default function Categories() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({ name: '', description: '' });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated' || session?.user?.role !== 'Admin') {
      router.push('/auth/signin');
    } else {
      const fetchCategories = async () => {
        const res = await fetch('/api/categories');
        const data: Category[] = await res.json();
        setCategories(data);
      };
      fetchCategories();
    }
  }, [session, status, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.name) {
      setError('Name is required');
      return;
    }

    try {
      const res = await fetch('/api/categories', {
        method: editingCategory ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, id: editingCategory?._id }),
      });

      const data: Category = await res.json();

      if (res.ok) {
        if (editingCategory) {
          setCategories(categories.map((cat) => (cat._id === editingCategory._id ? data : cat)));
          setEditingCategory(null);
        } else {
          setCategories([...categories, data]);
        }
        setForm({ name: '', description: '' });
        setError('');
      } else {
        setError((data as { message?: string }).message || 'Failed to save category');
      }
    } catch {
      setError('Failed to save category');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        const res = await fetch(`/api/categories?id=${id}`, { method: 'DELETE' });
        if (res.ok) {
          setCategories(categories.filter((cat) => cat._id !== id));
        } else {
          const data: { message?: string } = await res.json();
          setError(data.message || 'Failed to delete category');
        }
      } catch {
        setError('Failed to delete category');
      }
    }
  };

  if (status === 'loading') return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4 flex flex-col md:flex-row gap-4">
      <AdminSidebar />
      <div className="md:w-3/4">
        <Card className="bg-base-white border-accent-beige">
          <CardContent className="p-6">
            <h1 className="text-3xl font-heading text-primary-darkgreen mb-4">Categories</h1>
            <div className="mb-6">
              <h2 className="text-xl font-body text-primary-darkgreen mb-4">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" value={form.name} onChange={handleInputChange} className="border-accent-beige" />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={handleInputChange}
                    className="border-accent-beige"
                  />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <Button onClick={handleSubmit} className="bg-primary-darkgreen text-base-white hover:bg-primary-navy">
                  {editingCategory ? 'Update Category' : 'Add Category'}
                </Button>
                {editingCategory && (
                  <Button
                    variant="outline"
                    className="ml-2 border-accent-beige text-primary-darkgreen hover:bg-accent-beige"
                    onClick={() => {
                      setEditingCategory(null);
                      setForm({ name: '', description: '' });
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category,index) => (
                  <TableRow key={category._id || index}>
                    <TableCell>{category.name}</TableCell>
                    <TableCell>{category.description}</TableCell>
                    <TableCell className="flex space-x-2">
                      <Button
                        variant="outline"
                        className="border-accent-beige text-primary-darkgreen hover:bg-accent-beige"
                        onClick={() => {
                          setEditingCategory(category);
                          setForm({ name: category.name, description: category.description });
                        }}
                      >
                        Edit
                      </Button>
                      <Button variant="destructive" onClick={() => handleDelete(category._id)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
