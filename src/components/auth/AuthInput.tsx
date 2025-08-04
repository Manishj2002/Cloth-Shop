import { Input } from '@/components/ui/input';
   import { Label } from '@/components/ui/label';

   interface AuthInputProps {
     id: string;
     label: string;
     type: string;
     value: string;
     onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
     placeholder?: string;
     required?: boolean;
   }

   export function AuthInput({
     id,
     label,
     type,
     value,
     onChange,
     placeholder,
     required = false,
   }: AuthInputProps) {
     return (
       <div className="space-y-1">
         <Label htmlFor={id} className="text-sm font-body text-primary-darkgreen">
           {label}
         </Label>
         <Input
           id={id}
           type={type}
           value={value}
           onChange={onChange}
           placeholder={placeholder}
           required={required}
           className="border-accent-beige focus:ring-primary-darkgreen"
         />
       </div>
     );
   }