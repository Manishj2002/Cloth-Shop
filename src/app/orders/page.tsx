'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';

export default function UserOrders() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      const fetchOrders = async () => {
        const res = await fetch(
          `/api/orders?search=${search}&page=${page}&limit=${itemsPerPage}&userId=${session.user.id}`
        );
        const data = await res.json();
        setOrders(data.orders);
        setTotalPages(data.totalPages);
      };
      fetchOrders();
    }
  }, [session, status, router, search, page]);

  if (status === 'loading') return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <Card className="bg-base-white border-accent-beige">
        <CardContent className="p-6">
          <h1 className="text-3xl font-heading text-primary-darkgreen mb-4">My Orders</h1>
          <div className="mb-4">
            <Input
              placeholder="Search by order ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-accent-beige max-w-md"
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
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
                  <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{order.status}</TableCell>
                  <TableCell>${order.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <Button
                      asChild
                      variant="outline"
                      className="border-accent-beige text-primary-darkgreen hover:bg-accent-beige"
                    >
                      <Link href={`/orders/${order._id}`}>View</Link>
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
  );
}