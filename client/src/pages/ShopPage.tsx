import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useCart } from '../context/CartContext';

const API_BASE = 'http://localhost:4000/api';

type Product = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  oldPrice?: number | null;
  unit?: string | null;
  inStock: boolean;
  imageUrl?: string | null;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
};

type Category = {
  id: string;
  name: string;
  slug: string;
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

export default function ShopPage() {
  const { addItem } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(Number(searchParams.get('page') ?? '1'));
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '');

  const selectedCategory = searchParams.get('category') ?? 'all';
  const selectedSort = searchParams.get('sort') ?? 'newest';

  useEffect(() => {
    async function loadCategories() {
      const response = await fetch(`${API_BASE}/categories`);
      const json = await response.json();
      if (json.success) setCategories(json.data);
    }

    loadCategories();
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const nextParams = new URLSearchParams(searchParams);
      if (searchInput.trim()) {
        nextParams.set('search', searchInput.trim());
      } else {
        nextParams.delete('search');
      }
      nextParams.set('page', '1');
      setSearchParams(nextParams);
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        sort: selectedSort,
      });

      if (selectedCategory !== 'all') params.set('category', selectedCategory);
      if (searchParams.get('search')) params.set('search', searchParams.get('search') || '');

      const response = await fetch(`${API_BASE}/products?${params.toString()}`);
      const json = await response.json();

      if (json.success) {
        setProducts(json.data.items || []);
        setTotalPages(json.data.totalPages || 1);
      }

      setLoading(false);
    }

    fetchProducts();
  }, [page, searchParams, selectedCategory, selectedSort]);

  const activeCategoryLabel = useMemo(() => {
    if (selectedCategory === 'all') return 'All items';
    const category = categories.find((item) => item.slug === selectedCategory);
    return category ? category.name : 'Products';
  }, [categories, selectedCategory]);

  const updateSort = (value: string) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('sort', value);
    nextParams.set('page', '1');
    setSearchParams(nextParams);
    setPage(1);
  };

  const updateCategory = (slug: string) => {
    const nextParams = new URLSearchParams(searchParams);
    if (slug === 'all') nextParams.delete('category');
    else nextParams.set('category', slug);
    nextParams.set('page', '1');
    setSearchParams(nextParams);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-gradient-to-r from-brand-green to-brand-primary p-8 text-white shadow-soft">
        <h1 className="text-3xl font-black md:text-4xl">Shop all groceries</h1>
        <p className="mt-2 max-w-xl text-white/80">Fresh produce, pantry staples, and everyday essentials at honest prices.</p>
      </section>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`rounded-full px-4 py-2 text-sm font-medium ${selectedCategory === 'all' ? 'bg-brand-green text-white' : 'bg-white text-brand-green ring-1 ring-slate-200'}`}
            onClick={() => updateCategory('all')}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              className={`rounded-full px-4 py-2 text-sm font-medium ${selectedCategory === category.slug ? 'bg-brand-green text-white' : 'bg-white text-brand-green ring-1 ring-slate-200'}`}
              onClick={() => updateCategory(category.slug)}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search products"
            className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-primary"
          />
          <select
            value={selectedSort}
            onChange={(event) => updateSort(event.target.value)}
            className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none"
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-slate-600">
        <span>{activeCategoryLabel}</span>
        <span>{products.length} items</span>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="h-72 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <Card className="p-10 text-center text-slate-600">No products match your search yet. Try another keyword or category.</Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <Link key={product.id} to={`/products/${product.slug}`} className="block">
              <Card className="overflow-hidden transition hover:-translate-y-1 hover:shadow-lg">
                <img src={getImageUrl(product.imageUrl)} alt={product.name} className="h-52 w-full object-cover" />
                <div className="space-y-2 p-4">
                  <div className="text-xs uppercase tracking-wide text-slate-500">{product.category?.name || 'Groceries'}</div>
                  <h3 className="font-semibold text-brand-green">{product.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-brand-primary">{formatCurrency(product.price)}</span>
                    {product.oldPrice ? <span className="text-sm text-slate-400 line-through">{formatCurrency(product.oldPrice)}</span> : null}
                  </div>
                  <p className="text-sm text-slate-600">{product.unit || 'per pack'}</p>
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
      )}

      {totalPages > 1 ? (
        <div className="flex items-center justify-center gap-3">
          <Button variant="ghost" type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1}>
            Previous
          </Button>
          <span className="text-sm text-slate-600">
            Page {page} of {totalPages}
          </span>
          <Button variant="ghost" type="button" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page === totalPages}>
            Next
          </Button>
        </div>
      ) : null}
    </div>
  );
}
