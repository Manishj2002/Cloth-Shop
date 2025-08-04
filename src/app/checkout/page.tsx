'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthButton } from '@/components/auth/AuthButton';
import { useSession } from 'next-auth/react';

export default function Checkout() {
  const { data: session } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [addresses, setAddresses] = useState([]);
  const [cart, setCart] = useState({ items: [] });
  const [formData, setFormData] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phone: '',
    paymentMethod: 'COD',
    couponCode: '',
  });

  useEffect(() => {
    if (session) {
      Promise.all([fetch('/api/cart'), fetch('/api/addresses')]).then(
        ([cartRes, addressesRes]) => {
          cartRes.json().then((data) => setCart(data));
          addressesRes.json().then((data) => setAddresses(data));
        }
      );
    }
  }, [session]);

  const handleInputChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setStep(2);
      }
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shippingAddressId: addresses[0]?._id, // Use first address for simplicity
          paymentMethod: formData.paymentMethod,
          couponCode: formData.couponCode,
        }),
      });
      if (res.ok) {
        alert('Order placed successfully!');
        router.push('/orders');
      }
    }
  };

  if (!session) {
    return (
      <div className="text-center">
        <p className="text-primary-darkgreen">Please sign in to proceed with checkout.</p>
        <Link href="/auth/signin">
          <Button className="mt-4 bg-primary-darkgreen text-base-white hover:bg-primary-navy">
            Sign In
          </Button>
        </Link>
      </div>
    );
  }

  const total = cart.items.reduce(
    (sum: number, item: any) => sum + item.quantity * item.product.price,
    0
  );

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Checkout Form */}
      <div className="md:w-2/3">
        <h2 className="text-2xl font-heading text-primary-darkgreen mb-4">Checkout</h2>
        <div className="flex gap-4 mb-4">
          <div className={`flex-1 text-center ${step >= 1 ? 'text-primary-darkgreen' : 'text-gray-400'}`}>
            Step 1: Delivery Info
          </div>
          <div className={`flex-1 text-center ${step >= 2 ? 'text-primary-darkgreen' : 'text-gray-400'}`}>
            Step 2: Payment Method
          </div>
          <div className={`flex-1 text-center ${step >= 3 ? 'text-primary-darkgreen' : 'text-gray-400'}`}>
            Step 3: Review & Confirm
          </div>
        </div>
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {step === 1 && (
            <>
              <AuthInput
                id="name"
                label="Name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your name"
                required
              />
              <AuthInput
                id="street"
                label="Street"
                type="text"
                value={formData.street}
                onChange={(e) => handleInputChange('street', e.target.value)}
                placeholder="Enter your street"
                required
              />
              <AuthInput
                id="city"
                label="City"
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="Enter your city"
                required
              />
              <AuthInput
                id="state"
                label="State"
                type="text"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                placeholder="Enter your state"
                required
              />
              <AuthInput
                id="postalCode"
                label="Postal Code"
                type="text"
                value={formData.postalCode}
                onChange={(e) => handleInputChange('postalCode', e.target.value)}
                placeholder="Enter your postal code"
                required
              />
              <AuthInput
                id="country"
                label="Country"
                type="text"
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                placeholder="Enter your country"
                required
              />
              <AuthInput
                id="phone"
                label="Phone"
                type="text"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter your phone number"
                required
              />
            </>
          )}
          {step === 2 && (
            <div>
              <label className="text-sm font-body text-primary-darkgreen">Payment Method</label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(value) => handleInputChange('paymentMethod', value)}
              >
                <SelectTrigger className="border-accent-beige">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COD">Cash on Delivery</SelectItem>
                  <SelectItem value="Card">Credit/Debit Card</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                </SelectContent>
              </Select>
              <AuthInput
                id="couponCode"
                label="Coupon Code"
                type="text"
                value={formData.couponCode}
                onChange={(e) => handleInputChange('couponCode', e.target.value)}
                placeholder="Enter coupon code"
              />
            </div>
          )}
          {step === 3 && (
            <div>
              <h3 className="text-lg font-heading text-primary-darkgreen">Order Summary</h3>
              {cart.items.map((item: any) => (
                <div key={item._id} className="flex justify-between">
                  <p>
                    {item.product.name} (x{item.quantity}, {item.size}, {item.color})
                  </p>
                  <p>${(item.quantity * item.product.price).toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}
          <AuthButton label={step === 3 ? 'Place Order' : 'Continue'} />
        </motion.form>
      </div>

      {/* Order Summary */}
      <div className="md:w-1/3">
        <Card className="bg-base-white border-accent-beige sticky top-20">
          <CardContent className="p-4">
            <h2 className="text-xl font-heading text-primary-darkgreen mb-4">
              Order Summary
            </h2>
            <p className="text-primary-darkgreen font-bold">Total: ${total.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}