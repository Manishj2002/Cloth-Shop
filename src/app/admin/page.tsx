'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type Variant = {
  stock: number;
};

type Product = {
  _id: string;
  name: string;
  price: number;
  variants: Variant[];
};

type Order = {
  _id: string;
  totalAmount: number;
  status: string;
};

export default function AdminDashboard() {
  const { data: rawSession, status } = useSession();
 const session = rawSession;
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (session?.user?.role === 'Admin') {
      const fetchData = async () => {
        try {
          const [productsRes, ordersRes] = await Promise.all([
            fetch('/api/products'),
            fetch('/api/orders'),
          ]);

          if (productsRes.ok) {
            const productsData = await productsRes.json();
            setProducts(productsData);
          } else {
            console.error('Error fetching products:', await productsRes.text());
          }

          if (ordersRes.ok) {
            const ordersData = await ordersRes.json();
            setOrders(ordersData);
          } else {
            console.error('Error fetching orders:', await ordersRes.text());
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
      fetchData();
    }
  }, [session]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

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
          <Button asChild variant="outline" className="w-full border-accent-beige">
            <Link href="/admin/products">Products</Link>
          </Button>
          <Button asChild variant="outline" className="w-full border-accent-beige">
            <Link href="/admin/orders">Orders</Link>
          </Button>
          <Button asChild variant="outline" className="w-full border-accent-beige">
            <Link href="/admin/users">Users</Link>
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
              {products.map((product: Product) => (
                <Card key={product._id} className="bg-base-white border-accent-beige">
                  <CardContent className="p-4 flex justify-between">
                    <div>
                      <p className="text-primary-darkgreen font-bold">{product.name}</p>
                      <p className="text-sm text-gray-600">${product.price.toFixed(2)}</p>
                      <p
                        className={`text-sm ${
                          product.variants.some((v: Variant) => v.stock > 0)
                            ? 'text-green-500'
                            : 'text-red-500'
                        }`}
                      >
                        {product.variants.some((v: Variant) => v.stock > 0) ? 'In Stock' : 'Out of Stock'}
                      </p>
                    </div>
                    <Button asChild className="bg-primary-darkgreen text-base-white hover:bg-primary-navy">
                      <Link href={`/admin/products/${product._id}`}>Edit</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xl font-heading text-primary-darkgreen mb-4">Orders</h3>
            <div className="space-y-4">
              {orders.map((order: Order) => (
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
                    <Button asChild className="bg-primary-darkgreen text-base-white hover:bg-primary-navy">
                      <Link href={`/admin/orders/${order._id}`}>View</Link>
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