import { useEffect, useState } from 'react';
import Card from '../components/ui/Card';

const API_BASE = 'http://localhost:4000/api';

type Settings = {
  businessName: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  address: string;
  openingHours?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
};

export default function ContactPage() {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    async function loadSettings() {
      const response = await fetch(`${API_BASE}/settings`);
      const json = await response.json();
      if (json.success) setSettings(json.data);
    }

    loadSettings();
  }, []);

  const directionsLink = settings?.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}` : '#';

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-gradient-to-r from-brand-green to-brand-primary p-8 text-white shadow-soft">
        <h1 className="text-3xl font-black md:text-4xl">Contact & About</h1>
        <p className="mt-2 max-w-xl text-white/80">We’re here to help with fresh groceries, family essentials, and a simple ordering experience.</p>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-brand-green">Visit or reach us</h2>
          <div className="mt-5 space-y-4 text-sm text-slate-700">
            <div>
              <div className="font-semibold text-slate-900">Phone</div>
              <a href={`tel:${settings?.phone || ''}`} className="text-brand-primary">{settings?.phone || 'Loading...'}</a>
            </div>
            <div>
              <div className="font-semibold text-slate-900">WhatsApp</div>
              <a href={`https://wa.me/${settings?.whatsappNumber || '2348072206245'}`} target="_blank" rel="noreferrer" className="text-brand-primary">
                {settings?.whatsappNumber || 'Loading...'}
              </a>
            </div>
            <div>
              <div className="font-semibold text-slate-900">Email</div>
              <a href={`mailto:${settings?.email || ''}`} className="text-brand-primary">{settings?.email || 'Loading...'}</a>
            </div>
            <div>
              <div className="font-semibold text-slate-900">Address</div>
              <p>{settings?.address || 'Loading...'}</p>
            </div>
            <div>
              <div className="font-semibold text-slate-900">Opening hours</div>
              <p>{settings?.openingHours || 'Open daily'}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-bold text-brand-green">Get directions</h2>
          <p className="mt-3 text-slate-600">Find us quickly and plan your visit with a map search.</p>
          <div className="mt-6 space-y-3">
            <a href={directionsLink} target="_blank" rel="noreferrer" className="inline-flex rounded-full bg-brand-primary px-4 py-2.5 text-sm font-medium text-white">Open Google Maps</a>
            <a href={`https://wa.me/${settings?.whatsappNumber || '2348072206245'}?text=${encodeURIComponent('Hello, I would like to place an order.')}`} target="_blank" rel="noreferrer" className="ml-3 inline-flex rounded-full border border-brand-green px-4 py-2.5 text-sm font-medium text-brand-green">Chat on WhatsApp</a>
          </div>
          <div className="mt-8 rounded-2xl border border-slate-200 bg-brand-offwhite p-4 text-sm text-slate-600">
            {settings?.businessName || 'Deprince Foodmart'} is committed to affordable groceries and dependable customer service for homes and businesses.
          </div>
        </Card>
      </div>
    </div>
  );
}
