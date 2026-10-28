type ToastProps = {
  message: string;
};

export default function Toast({ message }: ToastProps) {
  return (
    <div className="fixed bottom-5 right-5 z-50 rounded-xl bg-brand-green px-4 py-3 text-sm text-white shadow-lg">
      {message}
    </div>
  );
}
