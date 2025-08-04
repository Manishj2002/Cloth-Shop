import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

import connectMongoDB from '@/lib/mongodb';
import { Order } from '@/app/models/Order';
import { User } from '@/app/models/User';
import { Product } from '@/app/models/Product';
import { Category } from '@/app/models/Category';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'Admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectMongoDB();

    const totalOrders = await Order.countDocuments();
    const totalRevenue = (await Order.aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }]))[0]?.total || 0;
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalCategories = await Category.countDocuments();

    const monthlySales = await Order.aggregate([
      {
        $group: {
          _id: { $month: '$createdAt' },
          sales: { $sum: '$total' },
        },
      },
      {
        $sort: { '_id': 1 },
      },
      {
        $project: {
          month: {
            $arrayElemAt: [
              ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
              { $subtract: ['$_id', 1] },
            ],
          },
          sales: 1,
        },
      },
    ]);

    const recentOrders = await Order.find()
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    const lowStockProducts = await Product.find({
      'variants.stock': { $lte: 10 },
    }).select('name variants');

    return NextResponse.json({
      totalOrders,
      totalRevenue,
      totalUsers,
      totalProducts,
      totalCategories,
      monthlySales,
      recentOrders,
      lowStockProducts,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}