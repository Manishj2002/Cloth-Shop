'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AuthCard } from '@/components/auth/AuthCard';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthButton } from '@/components/auth/AuthButton';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [email, setEmail] = useState('');
  const [newsletterSuccess, setNewsletterSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/products?sort=new'),
        fetch('/api/categories'),
      ]);
      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();
      setProducts(productsData.slice(0, 6)); // Top 6 new products
      setCategories(categoriesData);
    };
    fetchData();
  }, []);

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    // Mock newsletter subscription
    setNewsletterSuccess('Subscribed successfully!');
    setEmail('');
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative h-96 bg-accent-beige rounded-lg overflow-hidden"
      >
        <div className="absolute inset-0 flex items-center justify-center text-center">
          <div>
            <h1 className="text-4xl font-heading text-primary-darkgreen">
              Discover Trendy Clothing
            </h1>
            <p className="text-lg text-primary-darkgreen mt-2">
              Shop the latest styles and deals!
            </p>
            <Link href="/products">
              <Button className="mt-4 bg-primary-darkgreen text-base-white hover:bg-primary-navy">
                Shop Now
              </Button>
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Featured Categories */}
      <section>
        <h2 className="text-2xl font-heading text-primary-darkgreen mb-4">
          Shop by Category
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category: any) => (
            <motion.div
              key={category._id}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <Link href={`/products?category=${category._id}`}>
                <Card className="bg-base-white border-accent-beige">
                  <CardContent className="p-4 text-center">
                    <h3 className="text-lg font-heading text-primary-darkgreen">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Top Deals */}
      <section>
        <h2 className="text-2xl font-heading text-primary-darkgreen mb-4">
          Top Deals
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {products.map((product: any) => (
            <motion.div
              key={product._id}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <Link href={`/product/${product._id}`}>
                <Card className="bg-base-white border-accent-beige">
                  <CardContent className="p-4">
                    <img
                      src={product.images[0] || '/placeholder.jpg'}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-md"
                    />
                    <h3 className="text-lg font-heading text-primary-darkgreen mt-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600">{product.description}</p>
                    <p className="text-primary-darkgreen font-bold mt-2">
                      ${product.discountPrice || product.price}
                    </p>
                    <Button className="mt-2 bg-primary-darkgreen text-base-white hover:bg-primary-navy">
                      Quick View
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section>
        <AuthCard title="Subscribe to Our Newsletter">
          <form onSubmit={handleNewsletter} className="space-y-4">
            <AuthInput
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
            {newsletterSuccess && (
              <p className="text-green-500 text-sm text-center">{newsletterSuccess}</p>
            )}
            <AuthButton label="Subscribe" />
          </form>
        </AuthCard>
      </section>
    </div>
  );
}
