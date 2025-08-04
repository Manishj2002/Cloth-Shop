import { NextResponse } from 'next/server';
   import bcrypt from 'bcryptjs';
   import connectMongoDB from '@/lib/mongodb';
   import { User } from '@/app/models/User';

   export async function POST(req: Request) {
     try {
       const { token, password } = await req.json();

       if (!token || !password) {
         return NextResponse.json({ message: 'Token and password are required' }, { status: 400 });
       }

       await connectMongoDB();
       const user = await User.findOne({
         resetPasswordToken: token,
         resetPasswordTokenExpiry: { $gt: new Date() },
       });

       if (!user) {
         return NextResponse.json({ message: 'Invalid or expired token' }, { status: 400 });
       }

       user.password = await bcrypt.hash(password, 10);
       user.resetPasswordToken = undefined;
       user.resetPasswordTokenExpiry = undefined;
       await user.save();

       return NextResponse.json({ message: 'Password reset successfully' }, { status: 200 });
     } catch {
  return NextResponse.json({ message: 'Server error' }, { status: 500 });
}
   }