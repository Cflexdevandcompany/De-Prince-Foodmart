import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useCart } from '../context/CartContext';
import { setStructuredData } from '../lib/seo';

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

export default function ProductPage() {
  const { slug } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProduct() {
      if (!slug) return;

      setLoading(true);
      const response = await fetch(`${API_BASE}/products/${slug}`);
      const json = await response.json();
      if (json.success) {
        setProduct(json.data);

        if (json.data.category?.slug) {
          const relatedResponse = await fetch(`${API_BASE}/products?page=1&category=${json.data.category.slug}`);
          const relatedJson = await relatedResponse.json();
          if (relatedJson.success) {
            setRelatedProducts((relatedJson.data.items || []).filter((item: Product) => item.slug !== slug).slice(0, 4));
          }
        }
      }

      setLoading(false);
    }

    loadProduct();
  }, [slug]);

  useEffect(() => {
    if (!product) return;

    setStructuredData({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      image: product.imageUrl,
      description: product.description || 'Fresh grocery product from Deprince Foodmart.',
      brand: {
        '@type': 'Brand',
        name: 'Deprince Foodmart',
      },
      offers: {
        '@type': 'Offer',
        priceCurrency: 'NGN',
        price: product.price,
        availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      },
    });
  }, [product]);

  const discountPercent = useMemo(() => {
    if (!product || !product.oldPrice || product.oldPrice <= product.price) return 0;
    return Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
  }, [product]);

  if (loading) {
    return <div className="h-96 animate-pulse rounded-2xl bg-slate-200" />;
  }

  if (!product) {
    return <Card className="p-10 text-center text-slate-600">This item could not be found.</Card>;
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="overflow-hidden p-3">
          <img src={getImageUrl(product.imageUrl)} alt={product.name} className="h-[420px] w-full rounded-2xl object-cover" />
        </Card>

        <div className="space-y-5">
          <div className="text-sm uppercase tracking-[0.2em] text-slate-500">{product.category?.name || 'Groceries'}</div>
          <h1 className="text-3xl font-black text-brand-green">{product.name}</h1>

          <div className="flex items-end gap-3">
            <span className="text-3xl font-black text-brand-primary">{formatCurrency(product.price)}</span>
            {product.oldPrice ? <span className="text-lg text-slate-400 line-through">{formatCurrency(product.oldPrice)}</span> : null}
            {discountPercent > 0 ? <span className="rounded-full bg-brand-orange/10 px-2 py-1 text-xs font-bold text-brand-orange">-{discountPercent}%</span> : null}
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className={`rounded-full px-2.5 py-1 ${product.inStock ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
              {product.inStock ? 'In stock' : 'Out of stock'}
            </span>
            <span>{product.unit || 'per pack'}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center overflow-hidden rounded-full border border-slate-200 bg-white">
              <button type="button" className="px-3 py-2 text-lg text-brand-green" onClick={() => setQuantity((current) => Math.max(1, current - 1))}>-</button>
              <span className="min-w-[52px] text-center text-sm font-medium text-slate-700">{quantity}</span>
              <button type="button" className="px-3 py-2 text-lg text-brand-green" onClick={() => setQuantity((current) => current + 1)}>+</button>
            </div>
            <Button
              type="button"
              onClick={() =>
                addItem({
                  productId: product.id,
                  slug: product.slug,
                  name: product.name,
                  unit: product.unit,
                  imageUrl: product.imageUrl,
                  price: product.price,
                  oldPrice: product.oldPrice,
                  inStock: product.inStock,
                }, quantity)
              }
            >
              Add to cart
            </Button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-brand-offwhite p-4 text-sm text-slate-700">
            {product.description || 'Fresh, quality products selected to keep your kitchen stocked with everyday essentials.'}
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 ? (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-brand-green">Related products</h2>
            <Link to="/shop" className="text-sm font-medium text-brand-primary">Browse all</Link>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {relatedProducts.map((item) => (
              <Link key={item.id} to={`/products/${item.slug}`} className="block">
                <Card className="overflow-hidden transition hover:-translate-y-1 hover:shadow-lg">
                  <img src={getImageUrl(item.imageUrl)} alt={item.name} className="h-40 w-full object-cover" />
                  <div className="space-y-2 p-4">
                    <h3 className="font-semibold text-brand-green">{item.name}</h3>
                    <div className="text-lg font-bold text-brand-primary">{formatCurrency(item.price)}</div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
