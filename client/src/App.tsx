import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ProtectedAdminRoute from './components/admin/ProtectedAdminRoute';
import AdminLayout from './components/admin/AdminLayout';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductPage from './pages/ProductPage';
import BlogPage from './pages/BlogPage';
import BlogDetailPage from './pages/BlogDetailPage';
import ContactPage from './pages/ContactPage';
import CartPage from './pages/CartPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import ProductsPage from './pages/admin/ProductsPage';
import CategoriesPage from './pages/admin/CategoriesPage';
import BannersPage from './pages/admin/BannersPage';
import AdminBlogPage from './pages/admin/AdminBlogPage';
import SettingsPage from './pages/admin/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import { setPageMetadata, setStructuredData } from './lib/seo';

function AppRoutes() {
  const location = useLocation();

  useEffect(() => {
    const routeMeta: Record<string, { title: string; description: string }> = {
      '/': {
        title: 'Deprince Foodmart | Fresh Groceries in Lagos',
        description: 'Fresh groceries, pantry staples, and household essentials from Deprince Foodmart.',
      },
      '/shop': {
        title: 'Shop | Deprince Foodmart',
        description: 'Browse fresh foodstuff, household essentials, and daily deals from Deprince Foodmart.',
      },
      '/blog': {
        title: 'Blog | Deprince Foodmart',
        description: 'Helpful guides and lifestyle updates for smart grocery shopping.',
      },
      '/contact': {
        title: 'Contact | Deprince Foodmart',
        description: 'Call, WhatsApp, email or visit Deprince Foodmart for fresh groceries and essentials.',
      },
      '/cart': {
        title: 'Cart | Deprince Foodmart',
        description: 'Review your items and checkout via WhatsApp.',
      },
    };

    const pageMeta = routeMeta[location.pathname] || {
      title: 'Deprince Foodmart',
      description: 'Fresh groceries and everyday essentials for homes and businesses in Lagos.',
    };

    setPageMetadata(pageMeta.title, pageMeta.description);
    setStructuredData({
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: 'Deprince Foodmart',
      description: 'Fresh groceries and household essentials in Lagos.',
      telephone: '08072206245',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Ajah Shopping Place, Obodo 1',
        addressLocality: 'Lagos',
        addressCountry: 'NG',
      },
      url: 'https://deprincefoodmart.com/',
    });
  }, [location.pathname]);

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/products/:slug" element={<ProductPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogDetailPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/cart" element={<CartPage />} />
      </Route>

      <Route path="/admin/login" element={<AdminLoginPage />} />

      <Route element={<ProtectedAdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/products" element={<ProductsPage />} />
          <Route path="/admin/categories" element={<CategoriesPage />} />
          <Route path="/admin/banners" element={<BannersPage />} />
          <Route path="/admin/blog" element={<AdminBlogPage />} />
          <Route path="/admin/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function App() {
  return <AppRoutes />;
}
