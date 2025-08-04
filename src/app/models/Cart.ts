import mongoose, { Schema, Document } from 'mongoose';

   export interface ICart extends Document {
     user: Schema.Types.ObjectId;
     items: {
       product: Schema.Types.ObjectId;
       quantity: number;
       size: string;
       color: string;
     }[];
     createdAt: Date;
     updatedAt: Date;
   }

   const cartSchema = new Schema<ICart>(
     {
       user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
       items: [
         {
           product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
           quantity: { type: Number, required: true, min: 1 },
           size: { type: String, required: true },
           color: { type: String, required: true },
         },
       ],
     },
     { timestamps: true }
   );

   export const Cart = mongoose.models.Cart || mongoose.model<ICart>('Cart', cartSchema);