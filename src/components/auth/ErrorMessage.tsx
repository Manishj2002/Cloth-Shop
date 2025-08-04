interface ErrorMessageProps {
     message: string;
   }

   export function ErrorMessage({ message }: ErrorMessageProps) {
     if (!message) return null;
     return <p className="text-red-500 text-sm text-center">{message}</p>;
   }