'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';
import AdminSidebar from '@/components/AdminSidebar';

export default function Products() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('name');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (status === 'unauthenticated' || (session && session.user.role !== 'Admin')) {
      router.push('/auth/signin');
    } else {
      const fetchProducts = async () => {
        const res = await fetch(
          `/api/products?search=${search}&sort=${sort}&page=${page}&limit=${itemsPerPage}&admin=true`
        );
        const data = await res.json();
        setProducts(data.products);
        setTotalPages(data.totalPages);
      };
      fetchProducts();
    }
  }, [session, status, router, search, sort, page]);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
        if (res.ok) {
          setProducts(products.filter((p) => p._id !== id));
        }
      } catch (error) {
        console.error('Error deleting product:', error);
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
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-heading text-primary-darkgreen">Products</h1>
              <Button asChild className="bg-primary-darkgreen text-base-white hover:bg-primary-navy">
                <Link href="/admin/products/new">Add Product</Link>
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-accent-beige"
              />
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="border-accent-beige w-full sm:w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="stock">Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.category?.name || 'N/A'}</TableCell>
                    <TableCell>${product.discountPrice || product.price}</TableCell>
                    <TableCell>{product.variants.reduce((sum: number, v: any) => sum + v.stock, 0)}</TableCell>
                    <TableCell>{product.isActive ? 'Yes' : 'No'}</TableCell>
                    <TableCell className="flex space-x-2">
                      <Button asChild variant="outline" className="border-accent-beige text-primary-darkgreen hover:bg-accent-beige">
                        <Link href={`/admin/products/edit/${product._id}`}>Edit</Link>
                      </Button>
                      <Button variant="destructive" onClick={() => handleDelete(product._id)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex justify-between mt-4">
              <Button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="bg-primary-darkgreen text-base-white hover:bg-primary-navy"
              >
                Previous
              </Button>
              <span className="text-primary-darkgreen">Page {page} of {totalPages}</span>
              <Button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="bg-primary-darkgreen text-base-white hover:bg-primary-navy"
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}