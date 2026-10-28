import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAdmin } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';

const settingsRouter = Router();

const settingSchema = z.object({
  body: z.object({
    businessName: z.string().min(1).optional(),
    ownerName: z.string().optional(),
    phone: z.string().optional(),
    whatsappNumber: z.string().optional(),
    email: z.string().email().optional(),
    address: z.string().optional(),
    openingHours: z.string().optional().nullable(),
    instagramUrl: z.string().url().optional().nullable(),
    facebookUrl: z.string().url().optional().nullable(),
    logoUrl: z.string().url().optional().nullable(),
    logoLightUrl: z.string().url().optional().nullable(),
    checkoutGreeting: z.string().optional(),
  }),
});

settingsRouter.get('/', requireAdmin, async (_req, res) => {
  const setting = await prisma.setting.findFirst();

  return res.json({
    success: true,
    data: setting || {
      id: 1,
      businessName: 'Deprince Foodmart',
      ownerName: '',
      phone: '08072206245',
      whatsappNumber: '2348072206245',
      email: 'deprincefoodmart@gmail.com',
      address: 'Ajah Shopping Place, Obodo 1, Lagos, Nigeria',
      openingHours: null,
      instagramUrl: null,
      facebookUrl: null,
      logoUrl: null,
      logoLightUrl: null,
      checkoutGreeting: 'Hello Deprince Foodmart, I would like to order the items below:',
    },
  });
});

settingsRouter.put('/', requireAdmin, validateRequest(settingSchema), async (req, res) => {
  const data = req.body;

  const setting = await prisma.setting.upsert({
    where: { id: 1 },
    update: data,
    create: {
      id: 1,
      businessName: data.businessName || 'Deprince Foodmart',
      ownerName: data.ownerName || '',
      phone: data.phone || '08072206245',
      whatsappNumber: data.whatsappNumber || '2348072206245',
      email: data.email || 'deprincefoodmart@gmail.com',
      address: data.address || 'Ajah Shopping Place, Obodo 1, Lagos, Nigeria',
      openingHours: data.openingHours || null,
      instagramUrl: data.instagramUrl || null,
      facebookUrl: data.facebookUrl || null,
      logoUrl: data.logoUrl || null,
      logoLightUrl: data.logoLightUrl || null,
      checkoutGreeting: data.checkoutGreeting || 'Hello Deprince Foodmart, I would like to order the items below:',
    },
  });

  return res.json({ success: true, data: setting });
});

export default settingsRouter;
