import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAdmin } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';

const bannersRouter = Router();

const imageUrlSchema = z.string().refine((value) => {
  if (/^https?:\/\//i.test(value)) return true;
  return /^\/(?!\/)[\w./-]+$/.test(value) && !value.includes('..');
}, 'Image URL must be an HTTP(S) URL or a local public path.');

const bannerSchema = z.object({
  body: z.object({
    imageUrl: imageUrlSchema,
    headline: z.string().optional().nullable(),
    subtext: z.string().optional().nullable(),
    buttonLabel: z.string().optional().nullable(),
    buttonLink: z.string().optional().nullable(),
    sortOrder: z.coerce.number().int().optional().default(0),
    active: z.coerce.boolean().optional().default(true),
  }),
});

bannersRouter.get('/', requireAdmin, async (_req, res) => {
  const banners = await prisma.banner.findMany({ orderBy: { sortOrder: 'asc' } });
  return res.json({ success: true, data: banners });
});

bannersRouter.post('/', requireAdmin, validateRequest(bannerSchema), async (req, res) => {
  const banner = await prisma.banner.create({ data: req.body });
  return res.status(201).json({ success: true, data: banner });
});

bannersRouter.patch('/:id', requireAdmin, validateRequest(bannerSchema), async (req, res) => {
  const banner = await prisma.banner.update({
    where: { id: req.params.id },
    data: req.body,
  });

  return res.json({ success: true, data: banner });
});

bannersRouter.delete('/:id', requireAdmin, async (req, res) => {
  await prisma.banner.delete({ where: { id: req.params.id } });
  return res.json({ success: true, data: { deleted: true } });
});

export default bannersRouter;
