'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import AdminSidebar from '@/components/AdminSidebar';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

type RevenueItem = {
  _id: {
    month: number;
    year: number;
  };
  total: number;
};

type ProductItem = {
  name: string;
  totalQuantity: number;
};

type CategoryItem = {
  _id: string;
  totalRevenue: number;
};

type UserItem = {
  _id: {
    month: number;
    year: number;
  };
  count: number;
};

type AnalyticsData = {
  monthlyRevenue: RevenueItem[];
  topProducts: ProductItem[];
  salesByCategory: CategoryItem[];
  newUsers: UserItem[];
};

export default function Analytics() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    monthlyRevenue: [],
    topProducts: [],
    salesByCategory: [],
    newUsers: [],
  });

  useEffect(() => {
    if (status === 'unauthenticated' || session?.user?.role !== 'Admin') {
      router.push('/auth/signin');
    } else {
      const fetchAnalytics = async () => {
        const res = await fetch('/api/analytics');
        const data = await res.json();
        setAnalytics(data);
      };
      fetchAnalytics();
    }
  }, [session, status, router]);

  if (status === 'loading') return <div>Loading...</div>;

  const monthlyRevenueData = {
    labels: analytics.monthlyRevenue.map(item => `${item._id.month}/${item._id.year}`),
    datasets: [
      {
        label: 'Revenue ($)',
        data: analytics.monthlyRevenue.map(item => item.total),
        backgroundColor: 'rgba(0, 100, 0, 0.5)',
        borderColor: 'rgba(0, 100, 0, 1)',
        borderWidth: 1,
      },
    ],
  };

  const topProductsData = {
    labels: analytics.topProducts.map(item => item.name),
    datasets: [
      {
        label: 'Units Sold',
        data: analytics.topProducts.map(item => item.totalQuantity),
        backgroundColor: 'rgba(0, 100, 0, 0.5)',
        borderColor: 'rgba(0, 100, 0, 1)',
        borderWidth: 1,
      },
    ],
  };

  const salesByCategoryData = {
    labels: analytics.salesByCategory.map(item => item._id),
    datasets: [
      {
        label: 'Revenue ($)',
        data: analytics.salesByCategory.map(item => item.totalRevenue),
        backgroundColor: [
          'rgba(0, 100, 0, 0.5)',
          'rgba(139, 69, 19, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
        ],
        borderColor: [
          'rgba(0, 100, 0, 1)',
          'rgba(139, 69, 19, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const newUsersData = {
    labels: analytics.newUsers.map(item => `${item._id.month}/${item._id.year}`),
    datasets: [
      {
        label: 'New Users',
        data: analytics.newUsers.map(item => item.count),
        backgroundColor: 'rgba(0, 100, 0, 0.5)',
        borderColor: 'rgba(0, 100, 0, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="container mx-auto p-4 flex flex-col md:flex-row gap-4">
      <AdminSidebar />
      <div className="md:w-3/4">
        <Card className="bg-base-white border-accent-beige">
          <CardContent className="p-6">
            <h1 className="text-3xl font-heading text-primary-darkgreen mb-4">Analytics</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-4">
                  <h2 className="text-xl font-body text-primary-darkgreen mb-4">Monthly Revenue</h2>
                  <Bar data={monthlyRevenueData} options={{ responsive: true }} />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <h2 className="text-xl font-body text-primary-darkgreen mb-4">Top Products</h2>
                  <Bar data={topProductsData} options={{ responsive: true }} />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <h2 className="text-xl font-body text-primary-darkgreen mb-4">Sales by Category</h2>
                  <Pie data={salesByCategoryData} options={{ responsive: true }} />
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <h2 className="text-xl font-body text-primary-darkgreen mb-4">New Users</h2>
                  <Bar data={newUsersData} options={{ responsive: true }} />
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
