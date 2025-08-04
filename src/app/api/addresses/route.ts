import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import connectMongoDB from '@/lib/mongodb';
import { Address } from '@/app/models/Address';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectMongoDB();
    const addresses = await Address.find({ user: session.user.id });
    return NextResponse.json(addresses, { status: 200 });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    if (!data.street || !data.city || !data.state || !data.zipCode || !data.country) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    await connectMongoDB();
    if (data.isDefault) {
      await Address.updateMany({ user: session.user.id }, { isDefault: false });
    }
    const address = await Address.create({ ...data, user: session.user.id });
    return NextResponse.json(address, { status: 201 });
  } catch (error) {
    console.error('Error adding address:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const data = await req.json();
    if (!id || !data.street || !data.city || !data.state || !data.zipCode || !data.country) {
      return NextResponse.json({ message: 'All fields and ID are required' }, { status: 400 });
    }

    await connectMongoDB();
    if (data.isDefault) {
      await Address.updateMany({ user: session.user.id }, { isDefault: false });
    }
    const address = await Address.findOneAndUpdate(
      { _id: id, user: session.user.id },
      data,
      { new: true }
    );
    if (!address) {
      return NextResponse.json({ message: 'Address not found' }, { status: 404 });
    }
    return NextResponse.json(address, { status: 200 });
  } catch (error) {
    console.error('Error updating address:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const data = await req.json();
    if (!id) {
      return NextResponse.json({ message: 'Address ID is required' }, { status: 400 });
    }

    await connectMongoDB();
    if (data.isDefault) {
      await Address.updateMany({ user: session.user.id }, { isDefault: false });
    }
    const address = await Address.findOneAndUpdate(
      { _id: id, user: session.user.id },
      { isDefault: data.isDefault },
      { new: true }
    );
    if (!address) {
      return NextResponse.json({ message: 'Address not found' }, { status: 404 });
    }
    return NextResponse.json(address, { status: 200 });
  } catch (error) {
    console.error('Error updating default address:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ message: 'Address ID is required' }, { status: 400 });
    }

    await connectMongoDB();
    const address = await Address.findOneAndDelete({ _id: id, user: session.user.id });
    if (!address) {
      return NextResponse.json({ message: 'Address not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Address deleted' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting address:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}