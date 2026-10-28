import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import multer from 'multer';
import { prisma } from '../lib/prisma.js';
import { signAdminToken } from '../lib/jwt.js';
import { requireAdmin } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import { cloudinary, isCloudinaryConfigured } from '../lib/cloudinary.js';

const adminRouter = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
      return;
    }

    cb(new Error('Only image files are allowed.'));
  },
});

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

adminRouter.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
  }),
});

const passwordSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(8),
    newPassword: z.string().min(8),
  }),
});

const productSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    categoryId: z.string().min(1),
    description: z.string().optional().nullable(),
    price: z.coerce.number().int().nonnegative(),
    oldPrice: z.coerce.number().int().nonnegative().optional().nullable(),
    unit: z.string().optional().nullable(),
    inStock: z.coerce.boolean().optional().default(true),
    featured: z.coerce.boolean().optional().default(false),
    imageUrl: z.string().url().optional().nullable(),
  }),
});

const categorySchema = z.object({
  body: z.object({
    name: z.string().min(1),
    imageUrl: z.string().url().optional().nullable(),
  }),
});

const priceSchema = z.object({
  body: z.object({
    price: z.coerce.number().int().nonnegative(),
    oldPrice: z.coerce.number().int().nonnegative().optional().nullable(),
  }),
});

adminRouter.post(
  '/login',
  validateRequest(loginSchema),
  async (req, res) => {
    const { email, password } = req.body;

    const admin = await prisma.admin.findUnique({ where: { email } });

    if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Incorrect email or password.' },
      });
    }

    const token = signAdminToken(admin);

    res.cookie('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    return res.json({
      success: true,
      data: {
        admin: {
          id: admin.id,
          email: admin.email,
        },
      },
    });
  },
);

adminRouter.post('/logout', (_req, res) => {
  res.clearCookie('admin_token');
  return res.json({ success: true, data: null });
});

adminRouter.get('/me', requireAdmin, async (req, res) => {
  const admin = await prisma.admin.findUnique({ where: { id: req.user!.id } });

  if (!admin) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Admin not found.' },
    });
  }

  return res.json({
    success: true,
    data: {
      id: admin.id,
      email: admin.email,
    },
  });
});

adminRouter.patch(
  '/password',
  requireAdmin,
  validateRequest(passwordSchema),
  async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const admin = await prisma.admin.findUnique({ where: { id: req.user!.id } });

    if (!admin) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Admin not found.' },
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, admin.passwordHash);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PASSWORD', message: 'The current password is incorrect.' },
      });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.admin.update({
      where: { id: admin.id },
      data: { passwordHash },
    });

    return res.json({ success: true, data: { message: 'Password updated.' } });
  },
);

adminRouter.post('/upload', requireAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'No image file provided.' },
      });
    }

    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_FILE_TYPE', message: 'Only image files are allowed.' },
      });
    }

    if (req.file.size > 3 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        error: { code: 'FILE_TOO_LARGE', message: 'Image must be under 3 MB.' },
      });
    }

    if (!isCloudinaryConfigured()) {
      return res.status(503).json({
        success: false,
        error: {
          code: 'CLOUDINARY_NOT_CONFIGURED',
          message: 'Cloudinary is not configured yet. Set environment credentials first.',
        },
      });
    }

    const dataUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    const uploadResult = await cloudinary.uploader.upload(dataUrl, {
      folder: 'deprince-foodmart',
      overwrite: false,
    });

    return res.json({
      success: true,
      data: {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      error: { code: 'UPLOAD_FAILED', message: 'Image upload failed.' },
    });
  }
});

adminRouter.get('/categories', requireAdmin, async (_req, res) => {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
  });

  return res.json({ success: true, data: categories });
});

adminRouter.post('/categories', requireAdmin, validateRequest(categorySchema), async (req, res) => {
  const { name, imageUrl } = req.body;
  const slug = slugify(name);

  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) {
    return res.status(400).json({
      success: false,
      error: { code: 'DUPLICATE_CATEGORY', message: 'A category with that name already exists.' },
    });
  }

  const category = await prisma.category.create({
    data: {
      name,
      slug,
      imageUrl: imageUrl || null,
      sortOrder: Date.now() % 100000,
    },
  });

  return res.status(201).json({ success: true, data: category });
});

adminRouter.patch('/categories/:id', requireAdmin, validateRequest(categorySchema), async (req, res) => {
  const { name, imageUrl } = req.body;
  const category = await prisma.category.update({
    where: { id: req.params.id },
    data: {
      name,
      slug: slugify(name),
      imageUrl: imageUrl || null,
    },
  });

  return res.json({ success: true, data: category });
});

adminRouter.delete('/categories/:id', requireAdmin, async (req, res) => {
  await prisma.category.delete({ where: { id: req.params.id } });
  return res.json({ success: true, data: { deleted: true } });
});

adminRouter.get('/products', requireAdmin, async (_req, res) => {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: { category: true },
  });

  return res.json({ success: true, data: products });
});

adminRouter.post('/products', requireAdmin, validateRequest(productSchema), async (req, res) => {
  const { name, categoryId, description, price, oldPrice, unit, inStock, featured, imageUrl } = req.body;

  const slug = `${slugify(name)}-${Date.now().toString(36)}`;
  const product = await prisma.product.create({
    data: {
      name,
      slug,
      description: description || null,
      price: Number(price),
      oldPrice: oldPrice !== undefined && oldPrice !== null ? Number(oldPrice) : null,
      unit: unit || null,
      inStock: Boolean(inStock),
      featured: Boolean(featured),
      imageUrl: imageUrl || null,
      categoryId,
    },
    include: { category: true },
  });

  return res.status(201).json({ success: true, data: product });
});

adminRouter.patch('/products/:id', requireAdmin, validateRequest(productSchema), async (req, res) => {
  const { name, categoryId, description, price, oldPrice, unit, inStock, featured, imageUrl } = req.body;

  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: {
      name,
      slug: `${slugify(name)}-${Date.now().toString(36)}`,
      description: description || null,
      price: Number(price),
      oldPrice: oldPrice !== undefined && oldPrice !== null ? Number(oldPrice) : null,
      unit: unit || null,
      inStock: Boolean(inStock),
      featured: Boolean(featured),
      imageUrl: imageUrl || null,
      categoryId,
    },
    include: { category: true },
  });

  return res.json({ success: true, data: product });
});

adminRouter.patch('/products/:id/price', requireAdmin, validateRequest(priceSchema), async (req, res) => {
  const { price, oldPrice } = req.body;

  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: {
      price: Number(price),
      oldPrice: oldPrice !== undefined && oldPrice !== null ? Number(oldPrice) : null,
    },
    include: { category: true },
  });

  return res.json({ success: true, data: product });
});

adminRouter.delete('/products/:id', requireAdmin, async (req, res) => {
  await prisma.product.delete({ where: { id: req.params.id } });
  return res.json({ success: true, data: { deleted: true } });
});

export default adminRouter;
