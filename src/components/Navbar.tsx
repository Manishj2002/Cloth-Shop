'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShoppingCart, User, LogOut, LayoutDashboard, UserPlus, Menu, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navItems = (
    <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
      <Link href="/products" className="text-primary-darkgreen hover:text-primary-navy">
        Products
      </Link>
      {status === 'authenticated' && (
        <>
          <Link href="/orders" className="text-primary-darkgreen hover:text-primary-navy">
            Orders
          </Link>
          <Link href="/cart" className="text-primary-darkgreen hover:text-primary-navy">
            <ShoppingCart size={24} />
          </Link>
          <Link href="/profile" className="text-primary-darkgreen hover:text-primary-navy">
            <User size={24} />
          </Link>
          {session.user.role === 'Admin' && (
            <Link href="/admin/dashboard" className="text-primary-darkgreen hover:text-primary-navy">
              <LayoutDashboard size={24} />
            </Link>
          )}
          <Button
            variant="outline"
            className="border-accent-beige text-primary-darkgreen hover:bg-accent-beige w-full sm:w-auto"
            onClick={() => signOut({ callbackUrl: '/' })}
          >
            <LogOut size={20} className="mr-2" />
            Sign Out
          </Button>
        </>
      )}
      {status === 'unauthenticated' && (
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Link href="/auth/signin">
            <Button className="bg-primary-darkgreen text-base-white hover:bg-primary-navy w-full sm:w-auto">
              Sign In
            </Button>
          </Link>
          <Link href="/auth/signup">
            <Button
              variant="outline"
              className="border-accent-beige text-primary-darkgreen hover:bg-accent-beige w-full sm:w-auto"
            >
              <UserPlus size={20} className="mr-2" />
              Sign Up
            </Button>
          </Link>
        </div>
      )}
    </div>
  );

  return (
    <nav className="bg-base-white border-b border-accent-beige p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-heading text-primary-darkgreen">
          Clothing Store
        </Link>
        {/* Desktop Menu */}
        <div className="hidden sm:flex items-center">{navItems}</div>
        {/* Mobile Menu Toggle */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="sm:hidden text-primary-darkgreen hover:bg-accent-beige"
              onClick={toggleMenu}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-base-white border-accent-beige w-64">
            <div className="flex flex-col space-y-4 mt-4">{navItems}</div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}