import { NextResponse } from 'next/server';
   import connectMongoDB from '@/lib/mongodb';
   import { User } from '@/app/models/User';

   export async function POST(req: Request) {
     try {
       const { token } = await req.json();

       if (!token) {
         return NextResponse.json({ message: 'Verification token is required' }, { status: 400 });
       }

       await connectMongoDB();
       const user = await User.findOne({
         verificationToken: token,
         verificationTokenExpiry: { $gt: new Date() },
       });

       if (!user) {
         return NextResponse.json({ message: 'Invalid or expired token' }, { status: 400 });
       }

       user.isEmailVerified = true;
       user.verificationToken = undefined;
       user.verificationTokenExpiry = undefined;
       await user.save();

       return NextResponse.json({ message: 'Email verified successfully' }, { status: 200 });
     } catch {
  return NextResponse.json({ message: 'Server error' }, { status: 500 });
}

   }