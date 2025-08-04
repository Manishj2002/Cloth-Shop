'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Define types
interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface OrderItem {
  productId: string;
  product?: {
    name: string;
  };
  size: string;
  color: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  createdAt: string;
  status: string;
  paymentStatus: string;
  total: number;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
}

export default function OrderDetails() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { orderId } = useParams();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      const fetchOrder = async () => {
        const res = await fetch(
          `/api/orders?id=${orderId}&userId=${session.user.id}`
        );
        const data = await res.json();
        if (res.ok) {
          setOrder(data);
        } else {
          router.push('/orders');
        }
      };
      fetchOrder();
    }
  }, [session, status, router, orderId]);

  if (status === 'loading' || !order) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <Card className="bg-base-white border-accent-beige">
        <CardContent className="p-6">
          <h1 className="text-3xl font-heading text-primary-darkgreen mb-4">Order Details</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <h2 className="text-xl font-body text-primary-darkgreen">Order Info</h2>
              <p className="text-gray-600">Order ID: {order._id}</p>
              <p className="text-gray-600">Status: {order.status}</p>
              <p className="text-gray-600">Payment Status: {order.paymentStatus}</p>
              <p className="text-gray-600">Total: ${order.total.toFixed(2)}</p>
              <p className="text-gray-600">
                Date: {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <h2 className="text-xl font-body text-primary-darkgreen">Shipping Info</h2>
              <p className="text-gray-600">{order.shippingAddress.street}</p>
              <p className="text-gray-600">
                {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                {order.shippingAddress.zipCode}
              </p>
              <p className="text-gray-600">{order.shippingAddress.country}</p>
            </div>
          </div>
          <h2 className="text-xl font-body text-primary-darkgreen mb-4">Products Purchased</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item) => (
                <TableRow key={item.productId}>
                  <TableCell>{item.product?.name || 'N/A'}</TableCell>
                  <TableCell>{item.size}</TableCell>
                  <TableCell>{item.color}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>${item.price.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
