import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAdmin } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';

const blogRouter = Router();

const blogSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    excerpt: z.string().optional().nullable(),
    body: z.string().min(1),
    authorName: z.string().min(1),
    coverUrl: z.string().url().optional().nullable(),
    published: z.coerce.boolean().optional().default(false),
  }),
});

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

blogRouter.get('/', requireAdmin, async (_req, res) => {
  const posts = await prisma.blogPost.findMany({ orderBy: { createdAt: 'desc' } });
  return res.json({ success: true, data: posts });
});

blogRouter.post('/', requireAdmin, validateRequest(blogSchema), async (req, res) => {
  const { title, excerpt, body, authorName, coverUrl, published } = req.body;

  const post = await prisma.blogPost.create({
    data: {
      title,
      slug: `${slugify(title)}-${Date.now().toString(36)}`,
      excerpt: excerpt || null,
      body,
      authorName,
      coverUrl: coverUrl || null,
      published: Boolean(published),
    },
  });

  return res.status(201).json({ success: true, data: post });
});

blogRouter.patch('/:id', requireAdmin, validateRequest(blogSchema), async (req, res) => {
  const { title, excerpt, body, authorName, coverUrl, published } = req.body;

  const post = await prisma.blogPost.update({
    where: { id: req.params.id },
    data: {
      title,
      slug: `${slugify(title)}-${Date.now().toString(36)}`,
      excerpt: excerpt || null,
      body,
      authorName,
      coverUrl: coverUrl || null,
      published: Boolean(published),
    },
  });

  return res.json({ success: true, data: post });
});

blogRouter.delete('/:id', requireAdmin, async (req, res) => {
  await prisma.blogPost.delete({ where: { id: req.params.id } });
  return res.json({ success: true, data: { deleted: true } });
});

export default blogRouter;
