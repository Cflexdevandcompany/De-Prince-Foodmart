import type { NextFunction, Request, Response } from 'express';
import { verifyAdminToken } from '../lib/jwt.js';
import { prisma } from '../lib/prisma.js';

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.admin_token;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required.' },
    });
  }

  try {
    const payload = verifyAdminToken(token);
    const admin = await prisma.admin.findUnique({ where: { id: payload.sub } });

    if (!admin) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required.' },
      });
    }

    req.user = { id: admin.id, email: admin.email };
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required.' },
    });
  }
}
