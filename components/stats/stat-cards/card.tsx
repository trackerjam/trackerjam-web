import {ReactNode} from 'react';

interface CardElementProps {
  children: ReactNode;
}

export function CardElement({children}: CardElementProps) {
  return (
    <div className="flex flex-col items-center justify-center border-2 shadow p-4 rounded-xl gap-2 min-w-[160px]">
      {children}
    </div>
  );
}
