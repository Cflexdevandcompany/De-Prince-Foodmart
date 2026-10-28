import { useEffect, useState } from 'react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';

const defaultState = {
  businessName: 'Deprince Foodmart',
  ownerName: '',
  phone: '08072206245',
  whatsappNumber: '2348072206245',
  email: 'deprincefoodmart@gmail.com',
  address: 'Ajah Shopping Place, Obodo 1, Lagos, Nigeria',
  openingHours: '',
  instagramUrl: '',
  facebookUrl: '',
  logoUrl: '',
  logoLightUrl: '',
  checkoutGreeting: 'Hello Deprince Foodmart, I would like to order the items below:',
};

export default function SettingsPage() {
  const [form, setForm] = useState(defaultState);

  async function loadSettings() {
    const response = await fetch('http://localhost:4000/api/admin/settings', { credentials: 'include' });
    const json = await response.json();
    if (json.success) {
      setForm({
        ...defaultState,
        ...json.data,
      });
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    await fetch('http://localhost:4000/api/admin/settings', {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
  }

  return (
    <Card className="p-6">
      <h1 className="text-2xl font-bold text-brand-green">Settings</h1>
      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
        <Input label="Business name" value={form.businessName} onChange={(event) => setForm({ ...form, businessName: event.target.value })} />
        <Input label="Owner / Admin name" value={form.ownerName} onChange={(event) => setForm({ ...form, ownerName: event.target.value })} />
        <Input label="Phone" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
        <Input label="WhatsApp Number" value={form.whatsappNumber} onChange={(event) => setForm({ ...form, whatsappNumber: event.target.value })} />
        <Input label="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
        <Input label="Opening hours" value={form.openingHours} onChange={(event) => setForm({ ...form, openingHours: event.target.value })} />
        <Input label="Instagram URL" value={form.instagramUrl} onChange={(event) => setForm({ ...form, instagramUrl: event.target.value })} />
        <Input label="Facebook URL" value={form.facebookUrl} onChange={(event) => setForm({ ...form, facebookUrl: event.target.value })} />
        <Input label="Logo URL" value={form.logoUrl} onChange={(event) => setForm({ ...form, logoUrl: event.target.value })} />
        <Input label="Light logo URL" value={form.logoLightUrl} onChange={(event) => setForm({ ...form, logoLightUrl: event.target.value })} />
        <textarea
          className="md:col-span-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800"
          value={form.address}
          rows={3}
          onChange={(event) => setForm({ ...form, address: event.target.value })}
        />
        <textarea
          className="md:col-span-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800"
          value={form.checkoutGreeting}
          rows={3}
          onChange={(event) => setForm({ ...form, checkoutGreeting: event.target.value })}
        />
        <div className="md:col-span-2">
          <Button type="submit">Save settings</Button>
        </div>
      </form>
    </Card>
  );
}
