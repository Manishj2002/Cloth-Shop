import mongoose, { Schema, Document } from 'mongoose';

   export interface IProduct extends Document {
     name: string;
     description: string;
     price: number;
     discountPrice?: number;
     variants: {
       size: string;
       color: string;
       stock: number;
     }[];
     images: string[];
     category: Schema.Types.ObjectId;
     tags: string[];
     isActive: boolean;
     createdAt: Date;
     updatedAt: Date;
   }

   const productSchema = new Schema<IProduct>(
     {
       name: { type: String, required: true },
       description: { type: String, required: true },
       price: { type: Number, required: true },
       discountPrice: { type: Number },
       variants: [
         {
           size: { type: String, required: true },
           color: { type: String, required: true },
           stock: { type: Number, required: true, min: 0 },
         },
       ],
       images: [{ type: String }], // URLs from Cloudinary
       category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
       tags: [{ type: String }],
       isActive: { type: Boolean, default: true },
     },
     { timestamps: true }
   );

   export const Product = mongoose.models.Product || mongoose.model<IProduct>('Product', productSchema);