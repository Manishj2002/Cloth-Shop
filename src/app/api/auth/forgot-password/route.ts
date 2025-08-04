import { NextResponse } from 'next/server';
   import crypto from 'crypto';
   import connectMongoDB from '@/lib/mongodb';
   import { User } from '@/app/models/User';
   import { sendResetPasswordEmail } from '@/lib/email';

   export async function POST(req: Request) {
     try {
       const { email } = await req.json();

       if (!email) {
         return NextResponse.json({ message: 'Email is required' }, { status: 400 });
       }

       await connectMongoDB();
       const user = await User.findOne({ email });

       if (!user) {
         return NextResponse.json({ message: 'User not found' }, { status: 400 });
       }

       const resetToken = crypto.randomBytes(32).toString('hex');
       const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

       user.resetPasswordToken = resetToken;
       user.resetPasswordTokenExpiry = resetTokenExpiry;
       await user.save();

       await sendResetPasswordEmail(email, resetToken);

       return NextResponse.json({ message: 'Reset link sent to email' }, { status: 200 });
     } catch (error) {
       return NextResponse.json({ message: 'Server error' }, { status: 500 });
     }
   }