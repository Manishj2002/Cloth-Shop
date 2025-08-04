'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminSidebar from '@/components/AdminSidebar';

export default function Coupons() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discount: '',
    discountType: 'percentage',
    expiryDate: '',
    usageLimit: '',
  });
  const itemsPerPage = 10;

  useEffect(() => {
    if (status === 'unauthenticated' || (session && session.user.role !== 'Admin')) {
      router.push('/auth/signin');
    } else {
      const fetchCoupons = async () => {
        const res = await fetch(`/api/coupons?page=${page}&limit=${itemsPerPage}`);
        const data = await res.json();
        setCoupons(data.coupons);
        setTotalPages(data.totalPages);
      };
      fetchCoupons();
    }
  }, [session, status, router, page]);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newCoupon,
          discount: parseFloat(newCoupon.discount),
          usageLimit: parseInt(newCoupon.usageLimit),
          expiryDate: new Date(newCoupon.expiryDate),
        }),
      });
      if (res.ok) {
        const coupon = await res.json();
        setCoupons([coupon, ...coupons]);
        setNewCoupon({ code: '', discount: '', discountType: 'percentage', expiryDate: '', usageLimit: '' });
      }
    } catch (error) {
      console.error('Error creating coupon:', error);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/coupons?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      });
      if (res.ok) {
        setCoupons(coupons.map((coupon) => (coupon._id === id ? { ...coupon, isActive } : coupon)));
      }
    } catch (error) {
      console.error('Error updating coupon:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/coupons?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setCoupons(coupons.filter((coupon) => coupon._id !== id));
      }
    } catch (error) {
      console.error('Error deleting coupon:', error);
    }
  };

  if (status === 'loading') return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4 flex flex-col md:flex-row gap-4">
      <AdminSidebar />
      <div className="md:w-3/4">
        <Card className="bg-base-white border-accent-beige mb-6">
          <CardContent className="p-6">
            <h1 className="text-3xl font-heading text-primary-darkgreen mb-4">Create Coupon</h1>
            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div>
                <Label htmlFor="code" className="text-primary-darkgreen">Code</Label>
                <Input
                  id="code"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                  className="border-accent-beige"
                />
              </div>
              <div>
                <Label htmlFor="discount" className="text-primary-darkgreen">Discount</Label>
                <Input
                  id="discount"
                  type="number"
                  value={newCoupon.discount}
                  onChange={(e) => setNewCoupon({ ...newCoupon, discount: e.target.value })}
                  className="border-accent-beige"
                />
              </div>
              <div>
                <Label htmlFor="discountType" className="text-primary-darkgreen">Discount Type</Label>
                <select
                  id="discountType"
                  value={newCoupon.discountType}
                  onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value })}
                  className="w-full border-accent-beige rounded-md p-2"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed</option>
                </select>
              </div>
              <div>
                <Label htmlFor="expiryDate" className="text-primary-darkgreen">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={newCoupon.expiryDate}
                  onChange={(e) => setNewCoupon({ ...newCoupon, expiryDate: e.target.value })}
                  className="border-accent-beige"
                />
              </div>
              <div>
                <Label htmlFor="usageLimit" className="text-primary-darkgreen">Usage Limit</Label>
                <Input
                  id="usageLimit"
                  type="number"
                  value={newCoupon.usageLimit}
                  onChange={(e) => setNewCoupon({ ...newCoupon, usageLimit: e.target.value })}
                  className="border-accent-beige"
                />
              </div>
              <Button
                type="submit"
                className="bg-primary-darkgreen text-base-white hover:bg-primary-navy"
              >
                Create Coupon
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card className="bg-base-white border-accent-beige">
          <CardContent className="p-6">
            <h1 className="text-3xl font-heading text-primary-darkgreen mb-4">Coupons</h1>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Used/Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.map((coupon) => (
                  <TableRow key={coupon._id}>
                    <TableCell>{coupon.code}</TableCell>
                    <TableCell>{coupon.discount}{coupon.discountType === 'percentage' ? '%' : '$'}</TableCell>
                    <TableCell>{coupon.discountType}</TableCell>
                    <TableCell>{new Date(coupon.expiryDate).toLocaleDateString()}</TableCell>
                    <TableCell>{coupon.usedCount}/{coupon.usageLimit}</TableCell>
                    <TableCell>{coupon.isActive ? 'Active' : 'Inactive'}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        className="border-accent-beige text-primary-darkgreen hover:bg-accent-beige mr-2"
                        onClick={() => handleToggleActive(coupon._id, !coupon.isActive)}
                      >
                        {coupon.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleDelete(coupon._id)}
                      >
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