import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useCart } from '../context/CartContext';
import logoLight from '../assets/brand/obodo_logo_light_mood.svg';

const API_BASE = 'http://localhost:4000/api';

type Banner = {
  id: string;
  imageUrl: string;
  headline?: string | null;
  subtext?: string | null;
  buttonLabel?: string | null;
  buttonLink?: string | null;
};

type Category = {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  oldPrice?: number | null;
  unit?: string | null;
  inStock: boolean;
  featured: boolean;
  imageUrl?: string | null;
  category?: {
    name: string;
    slug: string;
  } | null;
};

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  coverUrl?: string | null;
  authorName: string;
};

type StoreSettings = {
  businessName: string;
  address: string;
  phone: string;
  logoLightUrl?: string | null;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(value);
}

function getImageUrl(url?: string | null) {
  return url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80';
}

export default function HomePage() {
  const { addItem } = useCart();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [latestProducts, setLatestProducts] = useState<Product[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        const [bannersResponse, categoriesResponse, productsResponse, blogResponse, settingsResponse] = await Promise.all([
          fetch(`${API_BASE}/banners`),
          fetch(`${API_BASE}/categories`),
          fetch(`${API_BASE}/products?page=1&sort=newest`),
          fetch(`${API_BASE}/blog`),
          fetch(`${API_BASE}/settings`),
        ]);

        const bannersData = await bannersResponse.json();
        const categoriesData = await categoriesResponse.json();
        const productsData = await productsResponse.json();
        const blogData = await blogResponse.json();
        const settingsData = await settingsResponse.json();

        setBanners(bannersData.success ? bannersData.data : []);
        setCategories(categoriesData.success ? categoriesData.data : []);

        if (productsData.success) {
          const allProducts = productsData.data.items || [];
          setFeaturedProducts(allProducts.filter((product: Product) => product.featured).slice(0, 4));
          setLatestProducts(allProducts.slice(0, 4));
        }

        setBlogPosts(blogData.success ? blogData.data.slice(0, 3) : []);
        setSettings(settingsData.success ? settingsData.data : null);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;

    const timer = window.setInterval(() => {
      setCurrentSlide((current) => (current + 1) % banners.length);
    }, 4000);

    return () => window.clearInterval(timer);
  }, [banners.length]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-72 animate-pulse rounded-[2rem] bg-slate-200" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-36 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  const activeBanner = banners[currentSlide] ?? banners[0];
  const bannerHeadline = activeBanner?.headline || 'Good food starts here';
  const [headlineLead, ...headlineHighlights] = bannerHeadline.split(',');
  const bannerLines = (activeBanner?.subtext || 'Quality groceries, delivered to you.\nDaily essentials for your home.').split('\n');
  const bannerLink = activeBanner?.buttonLink || '/shop';

  return (
    <div className="space-y-10 pb-8">
      {activeBanner ? (
        <section className="relative isolate min-h-[500px] overflow-hidden bg-[#044B18] px-5 py-7 text-white md:grid md:min-h-[430px] md:grid-cols-[1.15fr_0.85fr] md:items-center md:px-10 md:py-8">
          <img src={activeBanner.imageUrl} alt="" aria-hidden="true" className="pointer-events-none absolute bottom-0 right-0 h-[68%] w-[76%] object-contain object-right opacity-45 md:inset-y-0 md:h-full md:w-[55%] md:opacity-100" />
          <div className="relative z-10 max-w-3xl">
            <div className="mb-7 flex min-h-12 items-center gap-3">
              <img
                src={settings?.logoLightUrl || logoLight}
                alt={settings?.businessName || 'Deprince Foodmart'}
                className="max-h-12 max-w-56 object-contain object-left"
              />
            </div>
            <h1 className="inline-block max-w-full rounded-full border border-white/55 bg-white/15 px-4 py-3 text-xl font-black leading-tight md:px-6 md:py-4 md:text-4xl">
              {headlineLead}
              {headlineHighlights.length > 0 ? <>, <span className="text-[#FF8A16]">{headlineHighlights.join(',').trim()}</span></> : null}
            </h1>
            {bannerLines.length > 0 ? <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-white/90">{bannerLines[0]}</p> : null}
            {bannerLines.slice(1).length > 0 ? (
              <p className="mt-3 max-w-xl whitespace-pre-line text-base leading-relaxed text-white md:text-xl">
                {bannerLines.slice(1).join('\n')}
              </p>
            ) : null}
            {activeBanner.buttonLabel ? (
              <div className="mt-6">
                <Button variant="secondary" onClick={() => window.location.assign(bannerLink)}>
                  {activeBanner.buttonLabel}
                </Button>
              </div>
            ) : null}
            <p className="mt-7 text-sm font-semibold text-white/90 md:text-base">
              {settings?.address || 'Ajah Shopping Place, Obodo 1, Lagos'}
              {settings?.phone ? <><span className="mx-3">|</span>{settings.phone}</> : null}
            </p>
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        {categories.slice(0, 3).map((category) => (
          <Link key={category.id} to={`/shop?category=${category.slug}`} className="block">
            <Card className="flex h-full flex-col justify-between p-5 transition hover:-translate-y-1 hover:shadow-lg">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-offwhite text-lg text-brand-green">
                  {category.name.slice(0, 1)}
                </div>
                <div>
                  <div className="font-semibold text-brand-green">{category.name}</div>
                  <p className="text-xs text-slate-500">Explore deals</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-brand-green">Featured products</h2>
          <Link to="/shop" className="text-sm font-medium text-brand-primary">View all</Link>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {featuredProducts.map((product) => (
            <Link key={product.id} to={`/products/${product.slug}`} className="block">
              <Card className="overflow-hidden transition hover:-translate-y-1 hover:shadow-lg">
                <img src={getImageUrl(product.imageUrl)} alt={product.name} className="h-48 w-full object-cover" />
                <div className="space-y-2 p-4">
                  <div className="text-xs uppercase tracking-wide text-slate-500">{product.category?.name}</div>
                  <h3 className="font-semibold text-brand-green">{product.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-brand-primary">{formatCurrency(product.price)}</span>
                    {product.oldPrice ? <span className="text-sm text-slate-400 line-through">{formatCurrency(product.oldPrice)}</span> : null}
                  </div>
                  <button
                    type="button"
                    className="mt-2 inline-flex rounded-full bg-brand-primary px-3 py-2 text-xs font-medium text-white"
                    onClick={(event) => {
                      event.preventDefault();
                      addItem({
                        productId: product.id,
                        slug: product.slug,
                        name: product.name,
                        unit: product.unit,
                        imageUrl: product.imageUrl,
                        price: product.price,
                        oldPrice: product.oldPrice,
                        inStock: product.inStock,
                      }, 1);
                    }}
                  >
                    Add to cart
                  </button>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-brand-green">Latest arrivals</h2>
          <Link to="/shop" className="text-sm font-medium text-brand-primary">Shop now</Link>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {latestProducts.map((product) => (
            <Link key={product.id} to={`/products/${product.slug}`} className="block">
              <Card className="overflow-hidden transition hover:-translate-y-1 hover:shadow-lg">
                <img src={getImageUrl(product.imageUrl)} alt={product.name} className="h-48 w-full object-cover" />
                <div className="space-y-2 p-4">
                  <div className="text-xs uppercase tracking-wide text-slate-500">{product.category?.name}</div>
                  <h3 className="font-semibold text-brand-green">{product.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-brand-primary">{formatCurrency(product.price)}</span>
                    {product.oldPrice ? <span className="text-sm text-slate-400 line-through">{formatCurrency(product.oldPrice)}</span> : null}
                  </div>
                  <button
                    type="button"
                    className="mt-2 inline-flex rounded-full bg-brand-primary px-3 py-2 text-xs font-medium text-white"
                    onClick={(event) => {
                      event.preventDefault();
                      addItem({
                        productId: product.id,
                        slug: product.slug,
                        name: product.name,
                        unit: product.unit,
                        imageUrl: product.imageUrl,
                        price: product.price,
                        oldPrice: product.oldPrice,
                        inStock: product.inStock,
                      }, 1);
                    }}
                  >
                    Add to cart
                  </button>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] bg-brand-green p-8 text-white shadow-soft">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            ['Fresh picks', 'Everyday essentials selected for quality and value.'],
            ['Fast delivery', 'Delivery support for homes and businesses across Lagos.'],
            ['Trusted service', 'Friendly help, clear pricing, and straightforward WhatsApp orders.'],
          ].map(([title, description]) => (
            <div key={title} className="rounded-2xl border border-white/15 bg-white/5 p-5">
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-white/80">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-brand-green">Latest from our blog</h2>
          <Link to="/blog" className="text-sm font-medium text-brand-primary">Read more</Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {blogPosts.map((post) => (
            <Link key={post.id} to={`/blog/${post.slug}`} className="block">
              <Card className="overflow-hidden transition hover:-translate-y-1 hover:shadow-lg">
                <img src={getImageUrl(post.coverUrl)} alt={post.title} className="h-48 w-full object-cover" />
                <div className="space-y-2 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">{post.authorName}</p>
                  <h3 className="font-semibold text-brand-green">{post.title}</h3>
                  <p className="text-sm text-slate-600">{post.excerpt || 'Read the full update and learn more about smart shopping choices for your home.'}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
