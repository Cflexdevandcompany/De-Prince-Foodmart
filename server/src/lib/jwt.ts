import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'development-secret';

export type AdminJwtPayload = {
  sub: string;
  email: string;
};

export function signAdminToken(admin: { id: string; email: string }) {
  return jwt.sign({ sub: admin.id, email: admin.email }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyAdminToken(token: string): AdminJwtPayload {
  return jwt.verify(token, JWT_SECRET) as AdminJwtPayload;
}
