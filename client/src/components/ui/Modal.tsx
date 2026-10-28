import type { ReactNode } from 'react';

type ModalProps = {
  open: boolean;
  title?: string;
  children: ReactNode;
  onClose?: () => void;
};

export default function Modal({ open, title, children, onClose }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
        {title ? <h3 className="mb-4 text-lg font-semibold text-brand-green">{title}</h3> : null}
        {children}
        {onClose ? (
          <div className="mt-4 flex justify-end">
            <button onClick={onClose} className="text-sm text-slate-500 hover:text-brand-green">
              Close
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
