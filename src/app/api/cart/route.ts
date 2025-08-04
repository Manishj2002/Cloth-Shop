import { NextResponse } from 'next/server';
   import { getServerSession } from 'next-auth';
   import connectMongoDB from '@/lib/mongodb';
   import { Cart } from '@/app/models/Cart';
   import { authOptions } from '@/app/api/auth/[...nextauth]/route';

   export async function GET() {
     try {
       const session = await getServerSession(authOptions);
       if (!session) {
         return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
       }

       await connectMongoDB();
       const cart = await Cart.findOne({ user: session.user.id }).populate('items.product');
       return NextResponse.json(cart || { items: [] }, { status: 200 });
     } catch (error) {
       return NextResponse.json({ message: 'Server error' }, { status: 500 });
     }
   }

   export async function POST(req: Request) {
     try {
       const session = await getServerSession(authOptions);
       if (!session) {
         return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
       }

       const { productId, quantity, size, color } = await req.json();
       await connectMongoDB();

       let cart = await Cart.findOne({ user: session.user.id });
       if (!cart) {
         cart = await Cart.create({ user: session.user.id, items: [] });
       }

       const itemIndex = cart.items.findIndex(
         (item: any) => item.product.toString() === productId && item.size === size && item.color === color
       );

       if (itemIndex > -1) {
         cart.items[itemIndex].quantity += quantity;
       } else {
         cart.items.push({ product: productId, quantity, size, color });
       }

       await cart.save();
       return NextResponse.json({ message: 'Item added to cart' }, { status: 200 });
     } catch (error) {
       return NextResponse.json({ message: 'Server error' }, { status: 500 });
     }
   }

   export async function DELETE(req: Request) {
     try {
       const session = await getServerSession(authOptions);
       if (!session) {
         return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
       }

       const { itemId } = await req.json();
       await connectMongoDB();

       const cart = await Cart.findOne({ user: session.user.id });
       if (!cart) {
         return NextResponse.json({ message: 'Cart not found' }, { status: 404 });
       }

       cart.items = cart.items.filter((item: any) => item._id.toString() !== itemId);
       await cart.save();
       return NextResponse.json({ message: 'Item removed from cart' }, { status: 200 });
     } catch (error) {
       return NextResponse.json({ message: 'Server error' }, { status: 500 });
     }
   }