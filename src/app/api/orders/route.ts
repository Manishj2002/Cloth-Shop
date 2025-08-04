import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectMongoDB from '@/lib/mongodb';
import { Order } from '@/app/models/Order';
import { User } from '@/app/models/User';
import { Product } from '@/app/models/Product';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    await connectMongoDB();

    if (id) {
      let query: any = { _id: id };
      if (session.user.role !== 'Admin' && userId) {
        query.user = userId;
      }
      const order = await Order.findOne(query)
        .populate('user', 'name email')
        .populate('items.product', 'name');
      if (!order) {
        return NextResponse.json({ message: 'Order not found' }, { status: 404 });
      }
      return NextResponse.json(order, { status: 200 });
    }

    let query: any = session.user.role === 'Admin' ? {} : { user: session.user.id };
    if (userId && session.user.role !== 'Admin') {
      query.user = userId;
    }
    if (search) {
      if (session.user.role === 'Admin') {
        const users = await User.find({
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
          ],
        }).select('_id');
        query.$or = [
          { _id: { $regex: search, $options: 'i' } },
          { user: { $in: users.map((u) => u._id) } },
        ];
      } else {
        query._id = { $regex: search, $options: 'i' };
      }
    }
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await Order.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({ orders, totalPages }, { status: 200 });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'Admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const { status } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ message: 'Order ID and status are required' }, { status: 400 });
    }

    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
    }

    await connectMongoDB();
    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}