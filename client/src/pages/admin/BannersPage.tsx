import { useEffect, useState } from 'react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';

type Banner = {
  id: string;
  imageUrl: string;
  headline?: string | null;
  subtext?: string | null;
  buttonLabel?: string | null;
  buttonLink?: string | null;
  sortOrder: number;
  active: boolean;
};

const emptyForm = {
  imageUrl: '',
  headline: '',
  subtext: '',
  buttonLabel: '',
  buttonLink: '',
  sortOrder: '0',
  active: true,
};

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState('');

  async function loadBanners() {
    const response = await fetch('http://localhost:4000/api/admin/banners', { credentials: 'include' });
    const json = await response.json();
    if (json.success) setBanners(json.data);
  }

  useEffect(() => {
    loadBanners();
  }, []);

  async function handleImageUpload(file: File) {
    const formData = new FormData();
    formData.append('image', file);
    setFormError('');
    setUploading(true);

    try {
      const response = await fetch('http://localhost:4000/api/admin/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      const json = await response.json();
      if (!response.ok || !json.success) {
        setFormError(json.error?.message || 'Image upload failed. Check the server and Cloudinary settings.');
        return;
      }
      setForm((current) => ({ ...current, imageUrl: json.data.url }));
    } catch {
      setFormError('Could not reach the image upload service. Make sure the API is running.');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError('');
    if (!form.imageUrl) {
      setFormError('Add an image URL or upload an image before saving.');
      return;
    }
    const method = editingId ? 'PATCH' : 'POST';
    const url = editingId ? `http://localhost:4000/api/admin/banners/${editingId}` : 'http://localhost:4000/api/admin/banners';

    const response = await fetch(url, {
      method,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, sortOrder: Number(form.sortOrder), active: form.active }),
    });

    const json = await response.json();
    if (json.success) {
      setForm(emptyForm);
      setEditingId(null);
      loadBanners();
    } else {
      setFormError(json.error?.message || 'Banner could not be saved.');
    }
  }

  async function handleDelete(id: string) {
    const response = await fetch(`http://localhost:4000/api/admin/banners/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    const json = await response.json();
    if (json.success) loadBanners();
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h1 className="text-2xl font-bold text-brand-green">Banners</h1>
        <p className="mt-2 text-sm text-slate-600">Recommended size: 1600×600 px. Keep text central for mobile cropping.</p>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
          <Input label="Image URL" value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} />
          <label className="block text-sm font-medium text-slate-700">
            Upload banner image (max 3 MB)
            <input
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) handleImageUpload(file);
                event.target.value = '';
              }}
              className="mt-2 block w-full rounded-lg border border-slate-300 bg-white p-2 text-sm"
            />
          </label>
          <Input label="Sort order" type="number" value={form.sortOrder} onChange={(event) => setForm({ ...form, sortOrder: event.target.value })} />
          <Input label="Headline" value={form.headline} onChange={(event) => setForm({ ...form, headline: event.target.value })} />
          <Input label="Button label" value={form.buttonLabel} onChange={(event) => setForm({ ...form, buttonLabel: event.target.value })} />
          <Input label="Subtext" value={form.subtext} onChange={(event) => setForm({ ...form, subtext: event.target.value })} />
          <Input label="Button link" value={form.buttonLink} onChange={(event) => setForm({ ...form, buttonLink: event.target.value })} />

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} />
            Active
          </label>

          <div className="md:col-span-2 flex gap-3">
            <Button type="submit" disabled={uploading}>{uploading ? 'Uploading image...' : editingId ? 'Update banner' : 'Add banner'}</Button>
            {editingId ? (
              <Button type="button" variant="ghost" onClick={() => { setEditingId(null); setForm(emptyForm); }}>
                Cancel
              </Button>
            ) : null}
          </div>
          {formError ? <p role="alert" className="md:col-span-2 text-sm text-red-700">{formError}</p> : null}
        </form>
      </Card>

      <Card className="p-4">
        <div className="space-y-3">
          {banners.map((banner) => (
            <div key={banner.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <img src={banner.imageUrl} alt={banner.headline || 'Banner'} className="h-16 w-28 rounded-xl object-cover" />
                <div>
                  <div className="font-medium text-brand-green">{banner.headline || 'Untitled banner'}</div>
                  <div className="text-xs text-slate-500">Priority {banner.sortOrder}</div>
                </div>
              </div>

              <div className="flex gap-2">
                <button type="button" onClick={() => { setEditingId(banner.id); setForm({ imageUrl: banner.imageUrl, headline: banner.headline || '', subtext: banner.subtext || '', buttonLabel: banner.buttonLabel || '', buttonLink: banner.buttonLink || '', sortOrder: String(banner.sortOrder), active: banner.active }); }} className="text-brand-primary">Edit</button>
                <button type="button" onClick={() => handleDelete(banner.id)} className="text-red-600">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
