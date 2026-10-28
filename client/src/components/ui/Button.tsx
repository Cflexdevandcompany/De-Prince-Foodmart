import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  children: ReactNode;
};

export default function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
  const styles = {
    primary: 'bg-brand-primary text-white hover:bg-brand-green',
    secondary: 'bg-brand-orange text-white hover:bg-[#e65b00]',
    ghost: 'bg-white text-brand-green border border-brand-green/20 hover:bg-brand-offwhite',
  };

  return (
    <button
      className={`inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-medium transition ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
