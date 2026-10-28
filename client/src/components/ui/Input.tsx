import type { InputHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export default function Input({ label, className = '', ...props }: InputProps) {
  const base =
    'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10';

  return (
    <label className="block space-y-1 text-sm text-slate-700">
      {label ? <span>{label}</span> : null}
      <input className={`${base} ${className}`} {...props} />
    </label>
  );
}
