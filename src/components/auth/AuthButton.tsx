import { Button } from '@/components/ui/button';

interface AuthButtonProps {
  label: string;
  type?: 'submit' | 'button';
  disabled?: boolean;
  onClick?: () => void; // ✅ add this line
}

export function AuthButton({
  label,
  type = 'submit',
  disabled = false,
  onClick,
}: AuthButtonProps) {
  return (
    <Button
      type={type}
      disabled={disabled}
      onClick={onClick} // ✅ pass it here
      className="w-full bg-primary-darkgreen text-base-white hover:bg-primary-navy transition-colors"
    >
      {label}
    </Button>
  );
}
