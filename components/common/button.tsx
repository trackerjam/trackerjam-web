import clsx from 'clsx';
import Link from 'next/link';

const kindClassNames = {
  primary: '',
  secondary:
    'text-black bg-white px-4 py-3.5 rounded-lg hover:bg-[#E2E2E2] disabled:bg-[#292929] disabled:text-[#6b6b6b]',
};

type ButtonType = {
  className?: string;
  kind?: keyof typeof kindClassNames;
  href?: string;
  children: React.ReactNode;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
};

export function Button({
  className: additionalClassName,
  kind = 'primary',
  href = '',
  children,
  disabled,
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
      {...rest}
    >
      {children}
    </Tag>
  );
}
