import clsx from 'clsx';
import {ReactNode} from 'react';

interface CardElementProps {
  className?: string;
  children: ReactNode;
}

export function CardElement({className, children}: CardElementProps) {
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center border-2 shadow p-4 rounded-xl gap-2 min-w-[160px]',
        className
      )}
    >
      {children}
    </div>
  );
}
