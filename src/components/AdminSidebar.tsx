'use client';

import Link from 'next/link';
import { LayoutDashboard, Package, Users, Ticket, Star, BarChart, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminSidebar() {
  return (
    <div className="w-full md:w-1/4 bg-base-white border-r border-accent-beige p-4">
      <h2 className="text-2xl font-heading text-primary-darkgreen mb-4">Admin Panel</h2>
      <nav className="space-y-2">
        <Button
          asChild
          variant="ghost"
          className="w-full justify-start text-primary-darkgreen hover:bg-accent-beige"
        >
          <Link href="/admin/dashboard">
            <LayoutDashboard size={20} className="mr-2" />
            Dashboard
          </Link>
        </Button>
        <Button
          asChild
          variant="ghost"
          className="w-full justify-start text-primary-darkgreen hover:bg-accent-beige"
        >
          <Link href="/admin/products">
            <Package size={20} className="mr-2" />
            Products
          </Link>
        </Button>
        <Button
          asChild
          variant="ghost"
          className="w-full justify-start text-primary-darkgreen hover:bg-accent-beige"
        >
          <Link href="/admin/categories">
            <Package size={20} className="mr-2" />
            Categories
          </Link>
        </Button>
        <Button
          asChild
          variant="ghost"
          className="w-full justify-start text-primary-darkgreen hover:bg-accent-beige"
        >
          <Link href="/admin/orders">
            <Package size={20} className="mr-2" />
            Orders
          </Link>
        </Button>
        <Button
          asChild
          variant="ghost"
          className="w-full justify-start text-primary-darkgreen hover:bg-accent-beige"
        >
          <Link href="/admin/users">
            <Users size={20} className="mr-2" />
            Users
          </Link>
        </Button>
        <Button
          asChild
          variant="ghost"
          className="w-full justify-start text-primary-darkgreen hover:bg-accent-beige"
        >
          <Link href="/admin/coupons">
            <Ticket size={20} className="mr-2" />
            Coupons
          </Link>
        </Button>
        <Button
          asChild
          variant="ghost"
          className="w-full justify-start text-primary-darkgreen hover:bg-accent-beige"
        >
          <Link href="/admin/reviews">
            <Star size={20} className="mr-2" />
            Reviews
          </Link>
        </Button>
        <Button
          asChild
          variant="ghost"
          className="w-full justify-start text-primary-darkgreen hover:bg-accent-beige"
        >
          <Link href="/admin/charts">
            <BarChart size={20} className="mr-2" />
            Analytics
          </Link>
        </Button>
        <Button
          asChild
          variant="ghost"
          className="w-full justify-start text-primary-darkgreen hover:bg-accent-beige"
        >
          <Link href="/admin/settings">
            <Settings size={20} className="mr-2" />
            Settings
          </Link>
        </Button>
      </nav>
    </div>
  );
}