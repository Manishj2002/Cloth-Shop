import { v2 as cloudinary } from 'cloudinary';

   cloudinary.config({
     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
     api_key: process.env.CLOUDINARY_API_KEY,
     api_secret: process.env.CLOUDINARY_API_SECRET,
   });

   export const uploadImage = async (file: Buffer, folder: string = 'clothing-store') => {
     try {
       const result = await cloudinary.uploader.upload(`data:image/jpeg;base64,${file.toString('base64')}`, {
         folder,
       });
       return { url: result.secure_url, publicId: result.public_id };
     } catch (error) {
       console.error('Cloudinary upload error:', error);
       throw new Error('Failed to upload image');
     }
   };

   export const deleteImage = async (publicId: string) => {
     try {
       await cloudinary.uploader.destroy(publicId);
     } catch (error) {
       console.error('Cloudinary delete error:', error);
       throw new Error('Failed to delete image');
     }
   };