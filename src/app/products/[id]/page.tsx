'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState({ size: '', color: '' });
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products?id=${id}`);
        const data = await res.json();
        if (data[0]) {
          setProduct(data[0]);
          if (data[0]?.variants?.length > 0) {
            setSelectedVariant({
              size: data[0].variants[0].size || '',
              color: data[0].variants[0].color || '',
            });
            
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!selectedVariant.size || !selectedVariant.color) {
      alert('Please select a size and color');
      return;
    }
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: id,
        quantity,
        size: selectedVariant.size,
        color: selectedVariant.color,
      }),
    });
    if (res.ok) {
      alert('Added to cart!');
    } else {
      alert('Failed to add to cart');
    }
  };

  if (!product) return <div>Loading...</div>;

  const availableSizes = Array.from(
    new Set(product.variants.map((v: any) => v.size).filter((size: string) => size))
  );
  const availableColors = Array.from(
    new Set(
      product.variants
        .filter((v: any) => v.size === selectedVariant.size)
        .map((v: any) => v.color)
        .filter((color: string) => color)
    )
  );

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Image Gallery */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="md:w-1/2"
      >
        <img
          src={product.images[0] || '/placeholder.jpg'}
          alt={product.name}
          className="w-full h-96 object-cover rounded-md"
        />
      </motion.div>

      {/* Details Section */}
      <div className="md:w-1/2 space-y-4">
        <h1 className="text-3xl font-heading text-primary-darkgreen">{product.name}</h1>
        <p className="text-primary-darkgreen font-bold">
          ${product.discountPrice || product.price}
          {product.discountPrice && (
            <span className="text-sm text-gray-500 line-through ml-2">${product.price}</span>
          )}
        </p>
        {availableSizes.length > 0 ? (
          <div>
            <label className="text-sm font-body text-primary-darkgreen">Size</label>
            <Select
              value={selectedVariant.size}
              onValueChange={(value) => setSelectedVariant((prev) => ({ ...prev, size: value }))}
            >
              <SelectTrigger className="border-accent-beige">
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                {availableSizes.map((size) => (
                  <SelectItem key={size} value={size}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <p className="text-sm text-gray-600">No sizes available</p>
        )}
        {availableColors.length > 0 ? (
          <div>
            <label className="text-sm font-body text-primary-darkgreen">Color</label>
            <Select
              value={selectedVariant.color}
              onValueChange={(value) => setSelectedVariant((prev) => ({ ...prev, color: value }))}
            >
              <SelectTrigger className="border-accent-beige">
                <SelectValue placeholder="Select color" />
              </SelectTrigger>
              <SelectContent>
                {availableColors.map((color) => (
                  <SelectItem key={color} value={color}>
                    {color}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <p className="text-sm text-gray-600">No colors available</p>
        )}
        <div>
          <label className="text-sm font-body text-primary-darkgreen">Quantity</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-20 border-accent-beige p-2 rounded-md"
          />
        </div>
        <Button
          className="bg-primary-darkgreen text-base-white hover:bg-primary-navy"
          onClick={handleAddToCart}
        >
          Add to Cart
        </Button>
        <Tabs defaultValue="description" className="mt-4">
          <TabsList className="bg-accent-beige">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          <TabsContent value="description">
            <p className="text-gray-600">{product.description}</p>
          </TabsContent>
          <TabsContent value="reviews">
            <p className="text-gray-600">No reviews yet.</p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}