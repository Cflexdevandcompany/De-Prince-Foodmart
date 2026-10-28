import { Link, NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import logo from '../../assets/brand/obodo_logo.svg';
import { useCart } from '../../context/CartContext';

const API_BASE = 'http://localhost:4000/api';

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Shop', to: '/shop' },
  { label: 'Blog', to: '/blog' },
  { label: 'Contact', to: '/contact' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<{ businessName?: string; logoUrl?: string | null } | null>(null);
  const { itemCount, setCartOpen } = useCart();

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
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="container-shell flex items-center justify-between py-3">
        <Link to="/" className="flex items-center gap-3">
          <img src={settings?.logoUrl || logo} alt={settings?.businessName || 'Deprince Foodmart'} className="h-11 w-auto" />
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `text-sm font-medium transition ${isActive ? 'text-brand-primary' : 'text-slate-700 hover:text-brand-green'}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/shop" className="hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 md:block">
            Search
          </Link>
          <button type="button" onClick={() => setCartOpen(true)} className="relative rounded-full border border-brand-green/20 bg-brand-offwhite px-3 py-2 text-sm font-medium text-brand-green">
            Cart ({itemCount})
          </button>
          <button
            className="rounded-full border border-slate-200 p-2 text-brand-green md:hidden"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
          >
            ☰
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <div className="container-shell flex flex-col gap-2 py-3">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className="rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}
