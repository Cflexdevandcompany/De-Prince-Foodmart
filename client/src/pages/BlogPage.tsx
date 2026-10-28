import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';

const API_BASE = 'http://localhost:4000/api';

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  body: string;
  coverUrl?: string | null;
  authorName: string;
  createdAt?: string;
};

function getImageUrl(url?: string | null) {
  return url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80';
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPosts() {
      const response = await fetch(`${API_BASE}/blog`);
      const json = await response.json();
      if (json.success) setPosts(json.data);
      setLoading(false);
    }

    loadPosts();
  }, []);

  if (loading) {
    return <div className="h-72 animate-pulse rounded-2xl bg-slate-200" />;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-gradient-to-r from-brand-green to-brand-primary p-8 text-white shadow-soft">
        <h1 className="text-3xl font-black md:text-4xl">Foodmart journal</h1>
        <p className="mt-2 max-w-xl text-white/80">Tips, fresh ideas, and simple updates for smart kitchens and healthier shopping habits.</p>
      </section>

      {posts.length === 0 ? (
        <Card className="p-10 text-center text-slate-600">No blog posts are live yet. Check back soon.</Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.id} to={`/blog/${post.slug}`} className="block">
              <Card className="overflow-hidden transition hover:-translate-y-1 hover:shadow-lg">
                <img src={getImageUrl(post.coverUrl)} alt={post.title} className="h-56 w-full object-cover" />
                <div className="space-y-3 p-5">
                  <div className="text-xs uppercase tracking-wide text-slate-500">By {post.authorName}</div>
                  <h2 className="text-xl font-bold text-brand-green">{post.title}</h2>
                  <p className="text-sm text-slate-600">{post.excerpt || post.body.slice(0, 160)}</p>
                  <span className="text-sm font-medium text-brand-primary">Read article</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
