import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import connectMongoDB from '@/lib/mongodb';
import { Review } from '@/app/models/Review';
// import { Product } from '@/app/models/Product';
// import { User } from '@/app/models/User';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'Admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    await connectMongoDB();
    const reviews = await Review.find()
      .populate('user', 'name')
      .populate('product', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await Review.countDocuments();
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({ reviews, totalPages }, { status: 200 });
  } catch (error) {
    console.error('Error fetching reviews:', error);
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
    const { isApproved } = await req.json();

    if (!id || typeof isApproved !== 'boolean') {
      return NextResponse.json({ message: 'Review ID and approval status are required' }, { status: 400 });
    }

    await connectMongoDB();
    const review = await Review.findByIdAndUpdate(id, { isApproved }, { new: true });
    if (!review) {
      return NextResponse.json({ message: 'Review not found' }, { status: 404 });
    }

    return NextResponse.json(review, { status: 200 });
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'Admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Review ID is required' }, { status: 400 });
    }

    await connectMongoDB();
    const review = await Review.findByIdAndDelete(id);
    if (!review) {
      return NextResponse.json({ message: 'Review not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Review deleted' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}