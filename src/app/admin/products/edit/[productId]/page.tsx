'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import AdminSidebar from '@/components/AdminSidebar';

export default function EditProduct() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { productId } = useParams();
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    discountPrice: '',
    tags: '',
    isActive: true,
    variants: [{ size: '', color: '', stock: '' }],
    images: [] as File[],
    existingImages: [] as string[],
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated' || (session && session.user.role !== 'Admin')) {
      router.push('/auth/signin');
    } else {
      const fetchProduct = async () => {
        const res = await fetch(`/api/products?id=${productId}`);
        const data = await res.json();
        setForm({
          name: data.name,
          description: data.description,
          category: data.category?._id || '',
          price: data.price.toString(),
          discountPrice: data.discountPrice?.toString() || '',
          tags: data.tags.join(','),
          isActive: data.isActive,
          variants: data.variants,
          images: [],
          existingImages: data.images,
        });
      };
      const fetchCategories = async () => {
        const res = await fetch('/api/categories');
        const data = await res.json();
        setCategories(data);
      };
      fetchProduct();
      fetchCategories();
    }
  }, [session, status, router, productId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleVariantChange = (index: number, field: string, value: string) => {
    const newVariants = [...form.variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setForm({ ...form, variants: newVariants });
  };

  const addVariant = () => {
    setForm({ ...form, variants: [...form.variants, { size: '', color: '', stock: '' }] });
  };

  const removeVariant = (index: number) => {
    setForm({ ...form, variants: form.variants.filter((_, i) => i !== index) });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setForm({ ...form, images: Array.from(e.target.files) });
    }
  };

  const handleRemoveExistingImage = (index: number) => {
    setForm({ ...form, existingImages: form.existingImages.filter((_, i) => i !== index) });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.description || !form.category || !form.price || !form.variants.every(v => v.size && v.color && v.stock)) {
      setError('All fields are required');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('category', form.category);
      formData.append('price', form.price);
      if (form.discountPrice) formData.append('discountPrice', form.discountPrice);
      formData.append('tags', form.tags);
      formData.append('isActive', form.isActive.toString());
      formData.append('variants', JSON.stringify(form.variants));
      formData.append('existingImages', JSON.stringify(form.existingImages));
      form.images.forEach((file) => formData.append('images', file));

      const res = await fetch(`/api/products?id=${productId}`, {
        method: 'PUT',
        body: formData,
      });
      if (res.ok) {
        router.push('/admin/products');
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to update product');
      }
    } catch (err) {
      setError('Failed to update product');
    }
  };

  if (status === 'loading') return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4 flex flex-col md:flex-row gap-4">
      <AdminSidebar />
      <div className="md:w-3/4">
        <Card className="bg-base-white border-accent-beige">
          <CardContent className="p-6">
            <h1 className="text-3xl font-heading text-primary-darkgreen mb-4">Edit Product</h1>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" value={form.name} onChange={handleInputChange} className="border-accent-beige" />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input id="description" name="description" value={form.description} onChange={handleInputChange} className="border-accent-beige" />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={form.category} onValueChange={(value) => setForm({ ...form, category: value })}>
                  <SelectTrigger className="border-accent-beige">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input id="price" name="price" type="number" value={form.price} onChange={handleInputChange} className="border-accent-beige" />
                </div>
                <div>
                  <Label htmlFor="discountPrice">Discount Price</Label>
                  <Input id="discountPrice" name="discountPrice" type="number" value={form.discountPrice} onChange={handleInputChange} className="border-accent-beige" />
                </div>
              </div>
              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input id="tags" name="tags" value={form.tags} onChange={handleInputChange} className="border-accent-beige" />
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="isActive">Active</Label>
                <Switch id="isActive" checked={form.isActive} onCheckedChange={(checked) => setForm({ ...form, isActive: checked })} />
              </div>
              <div>
                <Label>Variants</Label>
                {form.variants.map((variant, index) => (
                  <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
                    <Input
                      placeholder="Size"
                      value={variant.size}
                      onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                      className="border-accent-beige"
                    />
                    <Input
                      placeholder="Color"
                      value={variant.color}
                      onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                      className="border-accent-beige"
                    />
                    <Input
                      placeholder="Stock"
                      type="number"
                      value={variant.stock}
                      onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
                      className="border-accent-beige"
                    />
                    {form.variants.length > 1 && (
                      <Button variant="destructive" onClick={() => removeVariant(index)}>Remove</Button>
                    )}
                  </div>
                ))}
                <Button variant="outline" className="border-accent-beige text-primary-darkgreen hover:bg-accent-beige" onClick={addVariant}>
                  Add Variant
                </Button>
              </div>
              <div>
                <Label>Existing Images</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {form.existingImages.map((url, index) => (
                    <div key={index} className="relative">
                      <img src={url} alt="Product" className="w-full h-24 object-cover rounded-md" />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-0 right-0"
                        onClick={() => handleRemoveExistingImage(index)}
                      >
                        X
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="images">Upload New Images</Label>
                <Input id="images" type="file" multiple accept="image/*" onChange={handleFileChange} className="border-accent-beige" />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button onClick={handleSubmit} className="bg-primary-darkgreen text-base-white hover:bg-primary-navy">
                Update Product
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}