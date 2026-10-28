import { useEffect, useState } from 'react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';

type BlogPost = {
  id: string;
  title: string;
  excerpt?: string | null;
  body: string;
  authorName: string;
  coverUrl?: string | null;
  published: boolean;
};

const emptyForm = {
  title: '',
  excerpt: '',
  body: '',
  authorName: '',
  coverUrl: '',
  published: false,
};

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function loadPosts() {
    const response = await fetch('http://localhost:4000/api/admin/blog', { credentials: 'include' });
    const json = await response.json();
    if (json.success) setPosts(json.data);
  }

  useEffect(() => {
    loadPosts();
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const method = editingId ? 'PATCH' : 'POST';
    const url = editingId ? `http://localhost:4000/api/admin/blog/${editingId}` : 'http://localhost:4000/api/admin/blog';

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
      loadPosts();
    }
  }

  async function handleDelete(id: string) {
    const response = await fetch(`http://localhost:4000/api/admin/blog/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    const json = await response.json();
    if (json.success) loadPosts();
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h1 className="text-2xl font-bold text-brand-green">Blog</h1>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
          <Input label="Title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
          <Input label="Author name" value={form.authorName} onChange={(event) => setForm({ ...form, authorName: event.target.value })} />
          <Input label="Cover URL" value={form.coverUrl} onChange={(event) => setForm({ ...form, coverUrl: event.target.value })} />
          <label className="flex items-center gap-2 text-sm text-slate-700 pt-7">
            <input type="checkbox" checked={form.published} onChange={(event) => setForm({ ...form, published: event.target.checked })} />
            Published
          </label>

          <Input label="Excerpt" value={form.excerpt} onChange={(event) => setForm({ ...form, excerpt: event.target.value })} />
          <textarea
            className="md:col-span-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800"
            rows={6}
            value={form.body}
            placeholder="Post body"
            onChange={(event) => setForm({ ...form, body: event.target.value })}
          />

          <div className="md:col-span-2 flex gap-3">
            <Button type="submit">{editingId ? 'Update post' : 'Add post'}</Button>
            {editingId ? (
              <Button type="button" variant="ghost" onClick={() => { setEditingId(null); setForm(emptyForm); }}>
                Cancel
              </Button>
            ) : null}
          </div>
        </form>
      </Card>

      <Card className="p-4">
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} className="flex items-center justify-between rounded-2xl border border-slate-200 p-3">
              <div>
                <div className="font-medium text-brand-green">{post.title}</div>
                <div className="text-xs text-slate-500">{post.authorName} • {post.published ? 'Published' : 'Draft'}</div>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => { setEditingId(post.id); setForm({ title: post.title, excerpt: post.excerpt || '', body: post.body, authorName: post.authorName, coverUrl: post.coverUrl || '', published: post.published }); }} className="text-brand-primary">Edit</button>
                <button type="button" onClick={() => handleDelete(post.id)} className="text-red-600">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
