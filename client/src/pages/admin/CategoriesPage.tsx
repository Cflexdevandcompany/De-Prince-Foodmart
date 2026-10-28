import { useEffect, useState } from 'react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';

type Category = {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
};

const emptyForm = {
  name: '',
  imageUrl: '',
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function loadCategories() {
    const response = await fetch('http://localhost:4000/api/admin/categories', { credentials: 'include' });
    const json = await response.json();
    if (json.success) setCategories(json.data);
  }

  useEffect(() => {
    loadCategories();
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const method = editingId ? 'PATCH' : 'POST';
    const url = editingId ? `http://localhost:4000/api/admin/categories/${editingId}` : 'http://localhost:4000/api/admin/categories';

    const response = await fetch(url, {
      method,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const json = await response.json();
    if (json.success) {
      setForm(emptyForm);
      setEditingId(null);
      loadCategories();
    }
  }

  async function handleDelete(id: string) {
    const response = await fetch(`http://localhost:4000/api/admin/categories/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    const json = await response.json();
    if (json.success) loadCategories();
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h1 className="text-2xl font-bold text-brand-green">Categories</h1>
        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
          <Input label="Category name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <Input label="Image URL (optional)" value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} />
          <div className="md:col-span-2 flex gap-3">
            <Button type="submit">{editingId ? 'Update category' : 'Add category'}</Button>
            {editingId ? (
              <Button type="button" variant="ghost" onClick={() => { setEditingId(null); setForm(emptyForm); }}>
                Cancel
              </Button>
            ) : null}
          </div>
        </form>
      </Card>

      <Card className="p-4">
        <div className="grid gap-3 md:grid-cols-2">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center justify-between rounded-2xl border border-slate-200 p-3">
              <div className="flex items-center gap-3">
                {category.imageUrl ? <img src={category.imageUrl} alt={category.name} className="h-10 w-10 rounded-lg object-cover" /> : null}
                <div>
                  <div className="font-medium text-brand-green">{category.name}</div>
                  <div className="text-xs text-slate-500">/{category.slug}</div>
                </div>
              </div>

              <div className="flex gap-2">
                <button type="button" onClick={() => { setEditingId(category.id); setForm({ name: category.name, imageUrl: category.imageUrl || '' }); }} className="text-brand-primary">Edit</button>
                <button type="button" onClick={() => handleDelete(category.id)} className="text-red-600">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
