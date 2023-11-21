import clsx from 'clsx';
import {useEffect} from 'react';
import {createPortal} from 'react-dom';
import {IoClose} from 'react-icons/io5';

const positionStyles = {
  right: {
    open: 'translate-x-0',
    close: 'translate-x-full',
  },
  left: {
    open: 'translate-x-0',
    close: '-translate-x-full',
  },
};

export function Drawer({
  className = '',
  children,
  id = '',
  onClose,
  isOpen,
  position = 'right',
  ...props
}: {
  children: React.ReactNode;
  onClose: () => void;
  isOpen: boolean;
  id?: string;
  className?: string;
  position?: 'left' | 'right';
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  return createPortal(
    <div className={className} aria-hidden={isOpen ? 'false' : 'true'} {...props}>
      <div
        className={clsx(
          'fixed top-0 z-[100] h-screen p-4 overflow-y-auto transition-transform bg-white w-96 px-6',
          position === 'right' ? 'right-0' : 'left-0',
          isOpen ? positionStyles[position].open : positionStyles[position].close
        )}
        role="dialog"
        tabIndex={isOpen ? 0 : -1}
        aria-modal={isOpen ? 'true' : 'false'}
        aria-hidden={isOpen ? 'false' : 'true'}
        id={id}
      >
        <button
          className="absolute top-4 right-4"
          onClick={onClose}
          aria-label="Close"
          type="button"
        >
          <IoClose size={24} />
        </button>
        {children}
      </div>
      <div
        className={clsx(
          'fixed inset-0 z-[90]',
          isOpen ? 'bg-gray-900/50 opacity-100 visible' : 'opacity-0 invisible'
        )}
        onClick={onClose}
      />
    </div>,
    document.body
  );
}
