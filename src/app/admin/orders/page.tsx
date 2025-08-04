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

export default function AdminOrders() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (status === 'unauthenticated' || (session && session.user.role !== 'Admin')) {
      router.push('/auth/signin');
    } else {
      const fetchOrders = async () => {
        const res = await fetch(
          `/api/orders?search=${search}&status=${statusFilter}&page=${page}&limit=${itemsPerPage}`
        );
        const data = await res.json();
        if (res.ok) {
          setOrders(data.orders);
          setTotalPages(data.totalPages);
        } else {
          console.error('Error fetching orders:', data.message);
        }
      };
      fetchOrders();
    }
  }, [session, status, router, search, statusFilter, page]);

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/orders?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setOrders(orders.map((order) => (order._id === id ? { ...order, status } : order)));
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (status === 'loading') return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4 flex flex-col md:flex-row gap-4">
      <AdminSidebar />
      <div className="md:w-3/4">
        <Card className="bg-base-white border-accent-beige">
          <CardContent className="p-6">
            <h1 className="text-3xl font-heading text-primary-darkgreen mb-4">Orders</h1>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <Input
                placeholder="Search by order ID or customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-accent-beige max-w-md"
              />
             <Select
  value={statusFilter === '' ? 'all' : statusFilter}
  onValueChange={(val) => setStatusFilter(val === 'all' ? '' : val)}
>
  <SelectTrigger className="border-accent-beige w-full sm:w-40">
    <SelectValue placeholder="Filter by status" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">All Statuses</SelectItem>
    <SelectItem value="Pending">Pending</SelectItem>
    <SelectItem value="Processing">Processing</SelectItem>
    <SelectItem value="Shipped">Shipped</SelectItem>
    <SelectItem value="Delivered">Delivered</SelectItem>
    <SelectItem value="Cancelled">Cancelled</SelectItem>
  </SelectContent>
</Select>

            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell>{order._id}</TableCell>
                    <TableCell>{order.user?.name || 'Guest'}</TableCell>
                    <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Select
                        value={order.status}
                        onValueChange={(value) => handleStatusUpdate(order._id, value)}
                      >
                        <SelectTrigger className="border-accent-beige w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Processing">Processing</SelectItem>
                          <SelectItem value="Shipped">Shipped</SelectItem>
                          <SelectItem value="Delivered">Delivered</SelectItem>
                          <SelectItem value="Cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>${order.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Button
                        asChild
                        variant="outline"
                        className="border-accent-beige text-primary-darkgreen hover:bg-accent-beige"
                      >
                        <Link href={`/admin/orders/${order._id}`}>View</Link>
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