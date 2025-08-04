import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

import connectMongoDB from '@/lib/mongodb';
import { Product } from '@/app/models/Product';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Category } from '@/app/models/Category';
import { uploadImage } from '@/lib/cloudinary';
import { FilterQuery } from 'mongoose';

// Define the ProductDocument type (adjust based on your Product schema)
interface ProductDocument {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  discountPrice?: number;
  tags: string[];
  isActive: boolean;
  variants: Variant[];
  images: string[];
  // Add other fields as needed
}

// Define the Variant type
interface Variant {
  size: string;
  color: string;
  stock: number;
}

// Define the SortOption type
type SortOption = Record<string, 1 | -1>;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const search = searchParams.get('search') || '';
    const sort = searchParams.get('sort') || 'name';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const admin = searchParams.get('admin') === 'true';

    await connectMongoDB();

    if (id) {
      const product = await Product.findById(id).populate('category');
      if (!product) {
        return NextResponse.json({ message: 'Product not found' }, { status: 404 });
      }
      return NextResponse.json(product, { status: 200 });
    }

    const query: FilterQuery<ProductDocument> = admin ? {} : { isActive: true };
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const sortOption: SortOption = {};
    if (sort === 'price') sortOption.price = 1;
    if (sort === 'stock') sortOption['variants.stock'] = 1;
    if (sort === 'name') sortOption.name = 1;

    const products = await Product.find(query)
      .populate('category')
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await Product.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({ products, totalPages }, { status: 200 });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'Admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const price = parseFloat(formData.get('price') as string);
    const discountPrice = formData.get('discountPrice') ? parseFloat(formData.get('discountPrice') as string) : undefined;
    const tags = (formData.get('tags') as string).split(',').map(tag => tag.trim());
    const isActive = formData.get('isActive') === 'true';
    const variants: Variant[] = JSON.parse(formData.get('variants') as string);
    const images = formData.getAll('images') as File[];

    if (!name || !description || !category || !price || !variants.every((v: Variant) => v.size && v.color && v.stock)) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    await connectMongoDB();
    const imageUrls = await Promise.all(
      images.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        const { url } = await uploadImage(buffer, 'products');
        return url;
      })
    );

    const product = await Product.create({
      name,
      description,
      category,
      price,
      discountPrice,
      tags,
      isActive,
      variants,
      images: imageUrls,
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error adding product:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'Admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ message: 'Product ID is required' }, { status: 400 });
    }

    const formData = await req.formData();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const price = parseFloat(formData.get('price') as string);
    const discountPrice = formData.get('discountPrice') ? parseFloat(formData.get('discountPrice') as string) : undefined;
    const tags = (formData.get('tags') as string).split(',').map(tag => tag.trim());
    const isActive = formData.get('isActive') === 'true';
    const variants: Variant[] = JSON.parse(formData.get('variants') as string);
    const existingImages = JSON.parse(formData.get('existingImages') as string);
    const images = formData.getAll('images') as File[];

    if (!name || !description || !category || !price || !variants.every((v: Variant) => v.size && v.color && v.stock)) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    await connectMongoDB();
    const imageUrls = await Promise.all(
      images.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        const { url } = await uploadImage(buffer, 'products');
        return url;
      })
    );

    const product = await Product.findByIdAndUpdate(
      id,
      {
        name,
        description,
        category,
        price,
        discountPrice,
        tags,
        isActive,
        variants,
        images: [...existingImages, ...imageUrls],
      },
      { new: true }
    );

    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    console.error('Error updating product:', error);
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
      return NextResponse.json({ message: 'Product ID is required' }, { status: 400 });
    }

    await connectMongoDB();
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Product deleted' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}