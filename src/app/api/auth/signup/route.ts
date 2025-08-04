import { NextResponse } from 'next/server';
   import bcrypt from 'bcryptjs';
   import crypto from 'crypto';
   import connectMongoDB from '@/lib/mongodb';
   import { User } from '@/app/models/User';
   import { sendVerificationEmail } from '@/lib/email';

   export async function POST(req: Request) {
     try {
       const { email, password, name } = await req.json();

       if (!email || !password || !name) {
         return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
       }

       await connectMongoDB();
       const existingUser = await User.findOne({ email });

       if (existingUser) {
         return NextResponse.json({ message: 'User already exists' }, { status: 400 });
       }

       const hashedPassword = await bcrypt.hash(password, 10);
       const verificationToken = crypto.randomBytes(32).toString('hex');
       const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

       await User.create({
         email,
         password: hashedPassword,
         name,
         role: 'User',
         verificationToken,
         verificationTokenExpiry,
       });

       await sendVerificationEmail(email, verificationToken);

       return NextResponse.json({ message: 'User created successfully. Please verify your email.' }, { status: 201 });
     } catch (error) {
       return NextResponse.json({ message: 'Server error' }, { status: 500 });
     }
   }