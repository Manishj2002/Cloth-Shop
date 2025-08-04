'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Category {
  _id: string;
  name: string;
  description: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  images: string[];
}

export default function ProductsClient() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    minPrice: '',
    maxPrice: '',
    sort: 'new',
  });

  useEffect(() => {
    const fetchData = async () => {
      const query = new URLSearchParams(filters).toString();
      const [productsRes, categoriesRes] = await Promise.all([
        fetch(`/api/products?${query}`),
        fetch('/api/categories'),
      ]);

      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();

      const productsArray = productsData.products || productsData;
      setProducts(productsArray);
      setCategories(categoriesData);
    };

    fetchData();
  }, [filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === 'all' ? '' : value,
    }));
  };

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Sidebar Filters */}
      <motion.aside
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5 }}
        className="md:w-1/4 bg-base-white p-4 rounded-lg sticky top-20"
      >
        <h2 className="text-xl font-heading text-primary-darkgreen mb-4">Filters</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-body text-primary-darkgreen">Category</label>
            <Select
              value={filters.category}
              onValueChange={(value) => handleFilterChange('category', value)}
            >
              <SelectTrigger className="border-accent-beige">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category._id} value={category._id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-body text-primary-darkgreen">Price Range</label>
            <input
              type="number"
              placeholder="Min Price"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              className="w-full border-accent-beige p-2 rounded-md"
            />
            <input
              type="number"
              placeholder="Max Price"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              className="w-full border-accent-beige p-2 rounded-md mt-2"
            />
          </div>
        </div>
      </motion.aside>

      {/* Product Grid */}
      <div className="md:w-3/4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-heading text-primary-darkgreen">All Products</h2>
          <Select
            value={filters.sort}
            onValueChange={(value) => handleFilterChange('sort', value)}
          >
            <SelectTrigger className="border-accent-beige w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">Newest</SelectItem>
              <SelectItem value="price-low-high">Price: Low to High</SelectItem>
              <SelectItem value="price-high-low">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {products.map((product) => (
            <motion.div
              key={product._id}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <Link href={`/product/${product._id}`}>
                <Card className="bg-base-white border-accent-beige">
                  <CardContent className="p-4">
                    <div className="w-full h-48 relative">
                      <Image
                        src={product.images[0] || '/placeholder.jpg'}
                        alt={product.name || 'Product Image'}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                    <h3 className="text-lg font-heading text-primary-darkgreen mt-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600">{product.description}</p>
                    <p className="text-primary-darkgreen font-bold mt-2">
                      ${product.discountPrice ?? product.price}
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
      </div>
    </div>
  );
}
