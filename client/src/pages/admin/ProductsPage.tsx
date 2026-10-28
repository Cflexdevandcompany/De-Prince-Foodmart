import { useEffect, useMemo, useState } from 'react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';

type Category = {
  id: string;
  name: string;
  slug: string;
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
  categoryId: string;
  category?: Category | null;
};

const emptyForm = {
  name: '',
  categoryId: '',
  description: '',
  price: '0',
  oldPrice: '',
  unit: '',
  inStock: true,
  featured: false,
  imageUrl: '',
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const term = search.toLowerCase();
      return product.name.toLowerCase().includes(term) || (product.category?.name || '').toLowerCase().includes(term);
    });
  }, [products, search]);

  async function loadCategories() {
    const response = await fetch('http://localhost:4000/api/admin/categories', {
      credentials: 'include',
    });
    const json = await response.json();
    if (json.success) setCategories(json.data);
  }

  async function loadProducts() {
    const response = await fetch('http://localhost:4000/api/admin/products', {
      credentials: 'include',
    });
    const json = await response.json();
    if (json.success) setProducts(json.data);
  }

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  async function handleImageUpload(file: File) {
    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    try {
      const response = await fetch('http://localhost:4000/api/admin/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      const json = await response.json();
      if (json.success) {
        setForm((current) => ({ ...current, imageUrl: json.data.url }));
      }
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const payload = {
      ...form,
      price: Number(form.price),
      oldPrice: form.oldPrice ? Number(form.oldPrice) : null,
      inStock: form.inStock,
      featured: form.featured,
    };

    const method = isEditing ? 'PATCH' : 'POST';
    const url = isEditing ? `http://localhost:4000/api/admin/products/${isEditing}` : 'http://localhost:4000/api/admin/products';

    const response = await fetch(url, {
      method,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const json = await response.json();
    if (json.success) {
      setForm(emptyForm);
      setIsEditing(null);
      loadProducts();
    }
  }

  async function handleDelete(productId: string) {
    const response = await fetch(`http://localhost:4000/api/admin/products/${productId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    const json = await response.json();
    if (json.success) loadProducts();
  }

  async function handleQuickPrice(productId: string, price: number) {
    await fetch(`http://localhost:4000/api/admin/products/${productId}/price`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ price }),
    });
    loadProducts();
  }

  async function toggleStock(productId: string, inStock: boolean) {
    const product = products.find((item) => item.id === productId);
    if (!product) return;

    await fetch(`http://localhost:4000/api/admin/products/${productId}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...product,
        inStock: !inStock,
        price: product.price,
      }),
    });
    loadProducts();
  }

  function beginEdit(product: Product) {
    setIsEditing(product.id);
    setForm({
      name: product.name,
      categoryId: product.categoryId,
      description: product.description || '',
      price: String(product.price),
      oldPrice: product.oldPrice ? String(product.oldPrice) : '',
      unit: product.unit || '',
      inStock: product.inStock,
      featured: product.featured,
      imageUrl: product.imageUrl || '',
    });
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h1 className="text-2xl font-bold text-brand-green">Products</h1>
        <p className="mt-2 text-sm text-slate-600">Add new items and manage stock, pricing, and featured products.</p>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
          <Input label="Product name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <select
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800"
            value={form.categoryId}
            onChange={(event) => setForm({ ...form, categoryId: event.target.value })}
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <textarea
            className="md:col-span-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800"
            rows={4}
            placeholder="Description"
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
          />

          <Input label="Price (₦)" type="number" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} />
          <Input label="Old price (optional)" type="number" value={form.oldPrice} onChange={(event) => setForm({ ...form, oldPrice: event.target.value })} />
          <Input label="Unit" value={form.unit} onChange={(event) => setForm({ ...form, unit: event.target.value })} />
          <div className="flex flex-col gap-2 pt-6">
            <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={form.inStock} onChange={(e) => setForm({ ...form, inStock: e.target.checked })} /> In stock</label>
            <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Featured</label>
          </div>

          <div className="md:col-span-2 space-y-2">
            <Input label="Image URL" value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} />
            <input
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) handleImageUpload(file);
              }}
            />
            {uploading ? <p className="text-sm text-brand-primary">Uploading image...</p> : null}
          </div>

          <div className="md:col-span-2 flex gap-3">
            <Button type="submit">{isEditing ? 'Update product' : 'Add product'}</Button>
            {isEditing ? (
              <Button type="button" variant="ghost" onClick={() => { setIsEditing(null); setForm(emptyForm); }}>
                Cancel
              </Button>
            ) : null}
          </div>
        </form>
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b border-slate-200 p-4">
          <Input
            value={search}
            placeholder="Search product or category"
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-t border-slate-200">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="h-10 w-10 rounded-lg object-cover" /> : null}
                      <div>
                        <div className="font-medium text-brand-green">{product.name}</div>
                        <div className="text-xs text-slate-500">{product.unit || 'per unit'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{product.category?.name || '—'}</td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      defaultValue={product.price}
                      onBlur={(event) => handleQuickPrice(product.id, Number(event.target.value))}
                      className="w-24 rounded-lg border border-slate-200 px-2 py-1"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => toggleStock(product.id, product.inStock)} className={`rounded-full px-2.5 py-1 text-xs font-medium ${product.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {product.inStock ? 'In stock' : 'Out of stock'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button type="button" onClick={() => beginEdit(product)} className="text-brand-primary">Edit</button>
                      <button type="button" onClick={() => handleDelete(product.id)} className="text-red-600">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
