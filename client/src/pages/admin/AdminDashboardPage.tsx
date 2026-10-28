const summaryCards = [
  { label: 'Products', value: 24 },
  { label: 'Categories', value: 8 },
  { label: 'Banners', value: 3 },
  { label: 'Blog posts', value: 2 },
  { label: 'Out of stock', value: 1 },
];

export default function AdminDashboardPage() {
  const ownerName = 'Deprince Foodmart';

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-r from-brand-green to-brand-primary p-8 text-white shadow-soft">
        <p className="text-sm uppercase tracking-[0.2em] text-white/70">Dashboard</p>
        <h1 className="mt-3 text-3xl font-bold">Welcome, {ownerName}</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {summaryCards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
            <p className="text-sm text-slate-500">{card.label}</p>
            <h2 className="mt-3 text-3xl font-bold text-brand-green">{card.value}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}
