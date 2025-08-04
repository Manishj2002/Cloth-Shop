import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
   import { ReactNode } from 'react';

   interface AuthCardProps {
     title: string;
     children: ReactNode;
   }

   export function AuthCard({ title, children }: AuthCardProps) {
     return (
       <div className="container mx-auto p-4 flex justify-center">
         <Card className="w-full max-w-md bg-base-white shadow-lg">
           <CardHeader>
             <CardTitle className="text-2xl font-heading text-primary-darkgreen text-center">
               {title}
             </CardTitle>
           </CardHeader>
           <CardContent className="space-y-4">{children}</CardContent>
         </Card>
       </div>
     );
   }