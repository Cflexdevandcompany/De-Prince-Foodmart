import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import CartDrawer from '../cart/CartDrawer';
import StickyCartBar from '../cart/StickyCartBar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-brand-offwhite text-slate-800">
      <Header />
      <main className="container-shell py-6 md:py-8 pb-24 md:pb-8">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <StickyCartBar />
    </div>
  );
}
