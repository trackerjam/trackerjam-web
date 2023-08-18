import clsx from 'clsx';
import Link from 'next/link';

const kindClassNames = {
  primary:
    'text-white bg-green-700 flex hover:bg-slate-100 font-medium items-center py-3.5 px-4 rounded-lg',
  secondary:
    'text-black bg-white px-4 py-3.5 rounded-lg hover:bg-[#E2E2E2] disabled:bg-[#292929] disabled:text-[#6b6b6b]',
  transparent: 'px-3 py-2.5 bg-transparent text-black hover:bg-gray-100 rounded-lg',
};

type ButtonType = {
  className?: string;
  kind?: keyof typeof kindClassNames;
  href?: string;
  children: React.ReactNode;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
};

export function Button({
  className: additionalClassName,
  kind = 'primary',
  href = '',
  children,
  disabled,
  onClick,
  ...rest
}: ButtonType) {
  const Tag = href ? Link : 'button';

  return (
    <Tag
      className={clsx(
        'inline-flex items-center leading-none transition-colors duration-200 font-medium',
        kindClassNames[kind],
        additionalClassName
      )}
      href={href}
      disabled={disabled}
      onClick={onClick}
      {...rest}
    >
      {children}
    </Tag>
  );
}
