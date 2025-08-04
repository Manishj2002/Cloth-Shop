import { Button } from '@/components/ui/button';

   interface AuthButtonProps {
     label: string;
     type?: 'submit' | 'button';
     disabled?: boolean;
   }

   export function AuthButton({ label, type = 'submit', disabled = false }: AuthButtonProps) {
     return (
       <Button
         type={type}
         disabled={disabled}
         className="w-full bg-primary-darkgreen text-base-white hover:bg-primary-navy transition-colors"
       >
         {label}
       </Button>
     );
   }