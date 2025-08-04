import { Button } from '@/components/ui/button';

interface SocialButtonProps {
  provider: string;
  onClick: () => void;
  action?: 'Sign in' | 'Sign up'; // Optional, defaults to 'Sign in'
}

export function SocialButton({ provider, onClick, action = 'Sign in' }: SocialButtonProps) {
  return (
    <Button
      variant="outline"
      className="w-full border-accent-beige text-primary-darkgreen hover:bg-accent-beige"
      onClick={onClick}
    >
      {action} with {provider}
    </Button>
  );
}
