type BadgeProps = {
  children: React.ReactNode;
  color?: 'green' | 'orange' | 'grey';
};

export default function Badge({ children, color = 'green' }: BadgeProps) {
  const palette = {
    green: 'bg-brand-primary/10 text-brand-primary',
    orange: 'bg-brand-orange/10 text-brand-orange',
    grey: 'bg-slate-100 text-slate-600',
  };

  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${palette[color]}`}>{children}</span>;
}
