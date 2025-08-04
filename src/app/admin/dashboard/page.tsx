'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';
import AdminSidebar from '@/components/AdminSidebar';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    recentOrders: [],
  });

  useEffect(() => {
    if (status === 'unauthenticated' || (session && session.user.role !== 'Admin')) {
      router.push('/auth/signin');
    } else {
      const fetchStats = async () => {
        const [ordersRes, usersRes, analyticsRes] = await Promise.all([
          fetch('/api/orders?page=1&limit=5'),
          fetch('/api/users?page=1&limit=1'),
          fetch('/api/analytics'),
        ]);
        const ordersData = await ordersRes.json();
        const usersData = await usersRes.json();
        const analyticsData = await analyticsRes.json();

        setStats({
          totalOrders: ordersData.totalPages * 10,
          totalUsers: usersData.totalPages * 10,
          totalRevenue: analyticsData.monthlyRevenue.reduce((sum: number, item: any) => sum + item.total, 0),
          recentOrders: ordersData.orders,
        });
      };
      fetchStats();
    }
  }, [session, status, router]);

  if (status === 'loading') return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4 flex flex-col md:flex-row gap-4">
      <AdminSidebar />
      <div className="md:w-3/4">
        <Card className="bg-base-white border-accent-beige">
          <CardContent className="p-6">
            <h1 className="text-3xl font-heading text-primary-darkgreen mb-4">Dashboard</h1>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <h2 className="text-xl font-body text-primary-darkgreen">Total Orders</h2>
                  <p className="text-2xl font-bold text-primary-darkgreen">{stats.totalOrders}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <h2 className="text-xl font-body text-primary-darkgreen">Total Users</h2>
                  <p className="text-2xl font-bold text-primary-darkgreen">{stats.totalUsers}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <h2 className="text-xl font-body text-primary-darkgreen">Total Revenue</h2>
                  <p className="text-2xl font-bold text-primary-darkgreen">${stats.totalRevenue.toFixed(2)}</p>
                </CardContent>
              </Card>
            </div>
            <h2 className="text-xl font-body text-primary-darkgreen mb-4">Recent Orders</h2>
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
                {stats.recentOrders.map((order: any) => (
                  <TableRow key={order._id}>
                    <TableCell>{order._id}</TableCell>
                    <TableCell>{order.user?.name || 'Guest'}</TableCell>
                    <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{order.status}</TableCell>
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
            <div className="mt-6 space-y-4">
              <Button
                asChild
                className="bg-primary-darkgreen text-base-white hover:bg-primary-navy"
              >
                <Link href="/admin/orders">Manage Orders</Link>
              </Button>
              <Button
                asChild
                className="bg-primary-darkgreen text-base-white hover:bg-primary-navy ml-2"
              >
                <Link href="/admin/users">Manage Users</Link>
              </Button>
              <Button
                asChild
                className="bg-primary-darkgreen text-base-white hover:bg-primary-navy ml-2"
              >
                <Link href="/admin/coupons">Manage Coupons</Link>
              </Button>
              <Button
                asChild
                className="bg-primary-darkgreen text-base-white hover:bg-primary-navy ml-2"
              >
                <Link href="/admin/reviews">Manage Reviews</Link>
              </Button>
              <Button
                asChild
                className="bg-primary-darkgreen text-base-white hover:bg-primary-navy ml-2"
              >
                <Link href="/admin/charts">View Analytics</Link>
              </Button>
              <Button
                asChild
                className="bg-primary-darkgreen text-base-white hover:bg-primary-navy ml-2"
              >
                <Link href="/admin/settings">Site Settings</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}