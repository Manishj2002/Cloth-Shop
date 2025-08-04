'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';

export default function AdminDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (session?.user.role === 'Admin') {
      Promise.all([
        fetch('/api/products'),
        fetch('/api/orders'),
        fetch('/api/users'),
      ]).then(([productsRes, ordersRes, usersRes]) => {
        productsRes.json().then((data) => setProducts(data));
        ordersRes.json().then((data) => setOrders(data));
        usersRes.json().then((data) => setUsers(data));
      });
    }
  }, [session]);

  if (!session || session.user.role !== 'Admin') {
    return (
      <div className="text-center">
        <p className="text-primary-darkgreen">Access denied. Admins only.</p>
        <Link href="/">
          <Button className="mt-4 bg-primary-darkgreen text-base-white hover:bg-primary-navy">
            Go to Home
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Side Menu */}
      <motion.aside
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5 }}
        className="md:w-1/4 bg-base-white p-4 rounded-lg sticky top-20"
      >
        <h2 className="text-xl font-heading text-primary-darkgreen mb-4">Admin Menu</h2>
        <nav className="space-y-2">
          <Button variant="outline" className="w-full border-accent-beige">
            Products
          </Button>
          <Button variant="outline" className="w-full border-accent-beige">
            Orders
          </Button>
          <Button variant="outline" className="w-full border-accent-beige">
            Users
          </Button>
        </nav>
      </motion.aside>

      {/* Main Content */}
      <div className="md:w-3/4">
        <h2 className="text-2xl font-heading text-primary-darkgreen mb-4">Admin Dashboard</h2>
        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-heading text-primary-darkgreen mb-4">Products</h3>
            <div className="space-y-4">
              {products.map((product: any) => (
                <Card key={product._id} className="bg-base-white border-accent-beige">
                  <CardContent className="p-4 flex justify-between">
                    <div>
                      <p className="text-primary-darkgreen font-bold">{product.name}</p>
                      <p className="text-sm text-gray-600">${product.price}</p>
                      <p
                        className={`text-sm ${
                          product.variants.some((v: any) => v.stock > 0)
                            ? 'text-green-500'
                            : 'text-red-500'
                        }`}
                      >
                        {product.variants.some((v: any) => v.stock > 0) ? 'In Stock' : 'Out of Stock'}
                      </p>
                    </div>
                    <Button className="bg-primary-darkgreen text-base-white hover:bg-primary-navy">
                      Edit
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xl font-heading text-primary-darkgreen mb-4">Orders</h3>
            <div className="space-y-4">
              {orders.map((order: any) => (
                <Card key={order._id} className="bg-base-white border-accent-beige">
                  <CardContent className="p-4 flex justify-between">
                    <div>
                      <p className="text-primary-darkgreen font-bold">Order #{order._id}</p>
                      <p className="text-sm text-gray-600">Total: ${order.totalAmount.toFixed(2)}</p>
                      <p
                        className={`text-sm ${
                          order.status === 'Delivered' ? 'text-green-500' : 'text-orange-500'
                        }`}
                      >
                        Status: {order.status}
                      </p>
                    </div>
                    <Button className="bg-primary-darkgreen text-base-white hover:bg-primary-navy">
                      View
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}