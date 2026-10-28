import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { logoutAdmin } from '../../lib/adminAuth';

const navItems = [
  { label: 'Dashboard', to: '/admin' },
  { label: 'Products', to: '/admin/products' },
  { label: 'Categories', to: '/admin/categories' },
  { label: 'Banners', to: '/admin/banners' },
  { label: 'Blog', to: '/admin/blog' },
  { label: 'Settings', to: '/admin/settings' },
];

export default function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login');
  };

  return (
    <div className="flex min-h-screen bg-brand-offwhite text-slate-800">
      <aside className="hidden w-72 border-r border-slate-200 bg-white p-5 md:block">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-brand-green">Deprince Admin</h2>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin'}
              className={({ isActive }) =>
                `block rounded-xl px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-brand-primary text-white' : 'text-slate-700 hover:bg-slate-100'}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-8 border-t border-slate-200 pt-4">
          <button onClick={handleLogout} className="w-full rounded-xl bg-brand-orange px-3 py-2 text-sm font-medium text-white">
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="md:hidden">
            <Link to="/admin" className="text-lg font-bold text-brand-green">Deprince Admin</Link>
          </div>
          <button onClick={handleLogout} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 md:hidden">
            Logout
          </button>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
