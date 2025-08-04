'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // Added import for Link
import Image from 'next/image'; // Added import for Image
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';

// Define interfaces for type safety
interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
}

interface CartItem {
  _id: string;
  product: Product;
  quantity: number;
  size: string;
  color: string;
}

interface Cart {
  items: CartItem[];
}

export default function Cart() {
  const { data: session } = useSession();
  const router = useRouter();
  const [cart, setCart] = useState<Cart>({ items: [] });

  useEffect(() => {
    if (session) {
      fetch('/api/cart')
        .then((res) => res.json())
        .then((data: Cart) => setCart(data));
    }
  }, [session]);

  const handleRemoveItem = async (itemId: string) => {
    const res = await fetch('/api/cart', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId }),
    });
    if (res.ok) {
      setCart((prev) => ({
        ...prev,
        items: prev.items.filter((item) => item._id !== itemId),
      }));
    }
  };

  const total = cart.items.reduce(
    (sum: number, item: CartItem) => sum + item.quantity * item.product.price,
    0
  );

  if (!session) {
    return (
      <div className="text-center">
        <p className="text-primary-darkgreen">Please sign in to view your cart.</p>
        <Link href="/auth/signin">
          <Button className="mt-4 bg-primary-darkgreen text-base-white hover:bg-primary-navy">
            Sign In
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Cart Items */}
      <div className="md:w-3/4">
        <h2 className="text-2xl font-heading text-primary-darkgreen mb-4">Your Cart</h2>
        {cart.items.length === 0 ? (
          <p className="text-gray-600">Your cart is empty.</p>
        ) : (
          <div className="space-y-4">
            {cart.items.map((item: CartItem) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-base-white border-accent-beige">
                  <CardContent className="p-4 flex items-center gap-4">
                    <Image
                      src={item.product.images[0] || '/placeholder.jpg'}
                      alt={item.product.name}
                      width={96}
                      height={96}
                      className="object-cover rounded-md"
                    />
                    <div className="flex-grow">
                      <h3 className="text-lg font-heading text-primary-darkgreen">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Size: {item.size}, Color: {item.color}
                      </p>
                      <p className="text-primary-darkgreen font-bold">
                        ${item.product.price} x {item.quantity}
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={() => handleRemoveItem(item._id)}
                    >
                      Remove
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Order Summary */}
      <div className="md:w-1/4">
        <Card className="bg-base-white border-accent-beige sticky top-20">
          <CardContent className="p-4">
            <h2 className="text-xl font-heading text-primary-darkgreen mb-4">
              Order Summary
            </h2>
            <p className="text-primary-darkgreen font-bold">Total: ${total.toFixed(2)}</p>
            <Button
              className="mt-4 w-full bg-primary-darkgreen text-base-white hover:bg-primary-navy"
              onClick={() => router.push('/checkout')}
              disabled={cart.items.length === 0}
            >
              Proceed to Checkout
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}