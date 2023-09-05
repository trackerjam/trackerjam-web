import clsx from 'clsx';
import Link from 'next/link';

const kindClassNames = {
  primary:
    'text-white bg-green-700 flex hover:bg-slate-100 font-medium items-center py-3.5 px-4 rounded-lg',
  secondary:
    'text-black bg-white px-4 py-3.5 rounded-lg hover:bg-[#E2E2E2] disabled:bg-[#292929] disabled:text-[#6b6b6b]',
  gray: 'px-2 py-1.5 text-12 text-black bg-gray-80 rounded hover:bg-gray-90',
  transparent: 'px-3 py-2.5 bg-transparent text-black hover:bg-gray-100 rounded-lg',
};

const sizeClassNames = {
  xs: 'text-12 px-2 py-1.5',
  sm: 'text-14 px-3 py-2.5',
  md: 'text-16 px-4 py-3.5',
};

type ButtonType = {
  className?: string;
  kind?: keyof typeof kindClassNames;
  size?: keyof typeof sizeClassNames;
  href?: string;
  children: React.ReactNode;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  isLoading?: boolean;
};

export function Button({
  className: additionalClassName,
  kind = 'primary',
  size = 'md',
  href = '',
  children,
  disabled,
  onClick,
  isLoading,
  ...rest
}: ButtonType) {
  const Tag = href ? Link : 'button';

  return (
    <Tag
      className={clsx(
        'inline-flex items-center leading-none transition-colors duration-200 font-medium disabled:opacity-25',
        kindClassNames[kind],
        sizeClassNames[size],
        additionalClassName
      )}
      href={href}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...rest}
    >
      {isLoading ? 'Loading...' : children}
    </Tag>
  );
}
