'use client';

   import { Button } from '@/components/ui/button';
   import { useRouter } from 'next/navigation';

   export default function AuthError() {
     const router = useRouter();

     return (
       <div className="container mx-auto p-4 flex justify-center">
         <div className="text-center">
           <h1 className="text-2xl font-heading text-primary-darkgreen mb-4">
             Authentication Error
           </h1>
           <p className="text-red-500 mb-4">An error occurred during authentication.</p>
           <Button
             className="bg-primary-darkgreen text-base-white"
             onClick={() => router.push('/auth/signin')}
           >
             Back to Sign In
           </Button>
         </div>
       </div>
     );
   }