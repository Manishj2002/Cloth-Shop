import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectMongoDB from '@/lib/mongodb';
import { User } from '@/app/models/User';
import { uploadImage } from '@/lib/cloudinary';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ message: 'No file provided' }, { status: 400 });
    }

    await connectMongoDB();
    const buffer = Buffer.from(await file.arrayBuffer());
    const { url } = await uploadImage(buffer, 'profile-pictures');

    const user = await User.findByIdAndUpdate(
      session.user.id,
      { profilePicture: url },
      { new: true }
    );

    return NextResponse.json({ message: 'Profile picture updated', profilePicture: url }, { status: 200 });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}