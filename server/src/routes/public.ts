import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { validateRequest } from '../middleware/validate.js';

const publicRouter = Router();

const paginationQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    category: z.string().optional(),
    search: z.string().optional(),
    sort: z.enum(['newest', 'price_asc', 'price_desc', 'name']).default('newest'),
  }),
});

const slugParamsSchema = z.object({
  params: z.object({
    slug: z.string().min(1),
  }),
});

function buildProductPayload(product: any) {
  return {
    ...product,
    price: Number(product.price),
    oldPrice: product.oldPrice == null ? null : Number(product.oldPrice),
    category: product.category
      ? {
          id: product.category.id,
          name: product.category.name,
          slug: product.category.slug,
        }
      : null,
  };
}

function buildSettingPayload(setting: any) {
  return {
    id: setting.id,
    businessName: setting.businessName,
    ownerName: setting.ownerName,
    phone: setting.phone,
    whatsappNumber: setting.whatsappNumber,
    email: setting.email,
    address: setting.address,
    openingHours: setting.openingHours,
    instagramUrl: setting.instagramUrl,
    facebookUrl: setting.facebookUrl,
    logoUrl: setting.logoUrl,
    logoLightUrl: setting.logoLightUrl,
    checkoutGreeting: setting.checkoutGreeting,
  };
}

publicRouter.get(
  '/products',
  validateRequest(paginationQuerySchema),
  async (req, res, next) => {
    try {
      const { page, category, search, sort } = paginationQuerySchema.shape.query.parse(req.query);

      const skip = (page - 1) * 12;
      const where: Record<string, unknown> = {};

      if (category && category !== 'all') {
        where.category = {
          slug: category,
        };
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      const orderBy: Record<string, 'asc' | 'desc'> = {};
      if (sort === 'price_asc') orderBy.price = 'asc';
      if (sort === 'price_desc') orderBy.price = 'desc';
      if (sort === 'name') orderBy.name = 'asc';
      if (sort === 'newest') orderBy.createdAt = 'desc';

      const [total, products] = await Promise.all([
        prisma.product.count({ where }),
        prisma.product.findMany({
          where,
          orderBy,
          skip,
          take: 12,
          include: {
            category: true,
          },
        }),
      ]);

      res.json({
        success: true,
        data: {
          items: products.map(buildProductPayload),
          page,
          total,
          totalPages: Math.ceil(total / 12),
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

publicRouter.get(
  '/products/:slug',
  validateRequest(slugParamsSchema),
  async (req, res, next) => {
    try {
      const { slug } = req.params;
      const product = await prisma.product.findUnique({
        where: { slug },
        include: { category: true },
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Product not found.' },
        });
      }

      return res.json({
        success: true,
        data: buildProductPayload(product),
      });
    } catch (error) {
      return next(error);
    }
  },
);

publicRouter.get('/categories', async (_req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
});

publicRouter.get('/banners', async (_req, res, next) => {
  try {
    const banners = await prisma.banner.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
    });

    res.json({
      success: true,
      data: banners,
    });
  } catch (error) {
    next(error);
  }
});

publicRouter.get('/blog', async (_req, res, next) => {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: posts,
    });
  } catch (error) {
    next(error);
  }
});

publicRouter.get(
  '/blog/:slug',
  validateRequest(slugParamsSchema),
  async (req, res, next) => {
    try {
      const post = await prisma.blogPost.findUnique({
        where: { slug: req.params.slug },
      });

      if (!post || !post.published) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Blog post not found.' },
        });
      }

      return res.json({
        success: true,
        data: post,
      });
    } catch (error) {
      return next(error);
    }
  },
);

publicRouter.get('/settings', async (_req, res, next) => {
  try {
    const setting = await prisma.setting.findFirst();

    if (!setting) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Settings not found.' },
      });
    }

    return res.json({
      success: true,
      data: buildSettingPayload(setting),
    });
  } catch (error) {
    return next(error);
  }
});

export default publicRouter;
