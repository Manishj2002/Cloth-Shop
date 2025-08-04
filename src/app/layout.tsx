import { Inter, Playfair_Display } from 'next/font/google';
   import './globals.css';
   import { ReactNode } from 'react';
   import Navbar from '@/components/Navbar';
   import { AuthProvider } from '@/components/AuthProvider';

   const inter = Inter({ subsets: ['latin'], variable: '--font-body' });
   const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-heading' });

   export const metadata = {
     title: 'Clothing Store',
     description: 'Your one-stop shop for trendy clothing',
   };

   export default function RootLayout({ children }: { children: ReactNode }) {
     return (
       <html lang="en">
         <body  suppressHydrationWarning={true} className={`${inter.variable} ${playfair.variable} min-h-screen flex flex-col bg-base-white`}>
          
           <AuthProvider>
             <Navbar />
             <main className="flex-grow container mx-auto p-4">{children}</main>
             <footer className="bg-accent-beige text-center p-4">
               <p>&copy; 2025 Clothing Store. All rights reserved.</p>
             </footer>
           </AuthProvider>
         </body>
       </html>
     );
   }