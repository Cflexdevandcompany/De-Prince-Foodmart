import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Card from '../components/ui/Card';

const API_BASE = 'http://localhost:4000/api';

type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  body: string;
  authorName: string;
  coverUrl?: string | null;
  createdAt?: string;
};

function getImageUrl(url?: string | null) {
  return url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80';
}

export default function BlogDetailPage() {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPost() {
      if (!slug) return;

      setLoading(true);
      const response = await fetch(`${API_BASE}/blog/${slug}`);
      const json = await response.json();
      if (json.success) setPost(json.data);
      setLoading(false);
    }

    loadPost();
  }, [slug]);

  if (loading) {
    return <div className="h-96 animate-pulse rounded-2xl bg-slate-200" />;
  }

  if (!post) {
    return <Card className="p-10 text-center text-slate-600">This article is unavailable right now.</Card>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link to="/blog" className="text-sm font-medium text-brand-primary">← Back to blog</Link>

      <Card className="overflow-hidden">
        <img src={getImageUrl(post.coverUrl)} alt={post.title} className="h-80 w-full object-cover" />
        <div className="space-y-5 p-6 md:p-8">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">By {post.authorName}</div>
          <h1 className="text-3xl font-black text-brand-green md:text-5xl">{post.title}</h1>
          {post.excerpt ? <p className="text-lg text-slate-600">{post.excerpt}</p> : null}
          <div className="whitespace-pre-line text-base leading-8 text-slate-700">{post.body}</div>
        </div>
      </Card>
    </div>
  );
}
