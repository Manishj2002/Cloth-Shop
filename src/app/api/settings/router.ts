import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectMongoDB from '@/lib/mongodb';
import { Settings } from '@/app/models/Settings';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'Admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectMongoDB();
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({
        deliveryCharge: 5.0,
        taxRate: 0.1,
        supportEmail: 'support@example.com',
        maintenanceMode: false,
      });
    }

    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'Admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const updates = await req.json();
    await connectMongoDB();
    const settings = await Settings.findOneAndUpdate({}, updates, { new: true, upsert: true });

    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}