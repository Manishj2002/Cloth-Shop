'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import AdminSidebar from '@/components/AdminSidebar';

export default function Settings() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [settings, setSettings] = useState({
    deliveryCharge: 5.0,
    taxRate: 0.1,
    supportEmail: 'support@example.com',
    maintenanceMode: false,
  });

  useEffect(() => {
    if (status === 'unauthenticated' || (session && session.user.role !== 'Admin')) {
      router.push('/auth/signin');
    } else {
      const fetchSettings = async () => {
        const res = await fetch('/api/settings');
        const data = await res.json();
        setSettings(data);
      };
      fetchSettings();
    }
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...settings,
          deliveryCharge: parseFloat(settings.deliveryCharge as any),
          taxRate: parseFloat(settings.taxRate as any),
        }),
      });
      if (res.ok) {
        const updatedSettings = await res.json();
        setSettings(updatedSettings);
      }
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  if (status === 'loading') return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4 flex flex-col md:flex-row gap-4">
      <AdminSidebar />
      <div className="md:w-3/4">
        <Card className="bg-base-white border-accent-beige">
          <CardContent className="p-6">
            <h1 className="text-3xl font-heading text-primary-darkgreen mb-4">Settings</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="deliveryCharge" className="text-primary-darkgreen">Delivery Charge ($)</Label>
                <Input
                  id="deliveryCharge"
                  type="number"
                  value={settings.deliveryCharge}
                  onChange={(e) => setSettings({ ...settings, deliveryCharge: e.target.value as any })}
                  className="border-accent-beige"
                />
              </div>
              <div>
                <Label htmlFor="taxRate" className="text-primary-darkgreen">Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  value={settings.taxRate}
                  onChange={(e) => setSettings({ ...settings, taxRate: e.target.value as any })}
                  className="border-accent-beige"
                />
              </div>
              <div>
                <Label htmlFor="supportEmail" className="text-primary-darkgreen">Support Email</Label>
                <Input
                  id="supportEmail"
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                  className="border-accent-beige"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="maintenanceMode" className="text-primary-darkgreen">Maintenance Mode</Label>
                <Switch
                  id="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
                />
              </div>
              <Button
                type="submit"
                className="bg-primary-darkgreen text-base-white hover:bg-primary-navy"
              >
                Save Settings
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}