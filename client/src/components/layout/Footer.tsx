import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import logoLight from '../../assets/brand/obodo_logo_light_mood.svg';

const API_BASE = 'http://localhost:4000/api';

type Settings = {
  businessName?: string;
  phone?: string;
  email?: string;
  address?: string;
  logoLightUrl?: string | null;
};

export default function Footer() {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch(`${API_BASE}/settings`);
        const json = await response.json();
        if (json.success) setSettings(json.data);
      } catch (_error) {
        setSettings(null);
      }
    }

    loadSettings();
  }, []);

  return (
    <footer className="mt-16 bg-brand-green text-white">
      <div className="container-shell grid gap-8 py-10 md:grid-cols-3">
        <div>
          <img src={settings?.logoLightUrl || logoLight} alt={settings?.businessName || 'Deprince Foodmart'} className="h-12 w-auto" />
          <p className="mt-4 max-w-xs text-sm text-white/80">
            Fresh, affordable groceries and foodstuff for homes in Lagos and beyond.
          </p>
        </div>

        <div>
          <h3 className="mb-3 text-lg font-semibold">Contact</h3>
          <ul className="space-y-2 text-sm text-white/80">
            <li>{settings?.phone || '08072206245'}</li>
            <li>{settings?.email || 'deprincefoodmart@gmail.com'}</li>
            <li>{settings?.address || 'Ajah Shopping Place, Obodo 1, Lagos, Nigeria'}</li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-lg font-semibold">Company</h3>
          <ul className="space-y-2 text-sm text-white/80">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/shop">Shop</Link></li>
            <li><Link to="/blog">Blog</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
