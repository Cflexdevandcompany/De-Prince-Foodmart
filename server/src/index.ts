import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import publicRouter from './routes/public.js';
import adminRouter from './routes/admin.js';
import adminSettingsRouter from './routes/admin-settings.js';
import adminBannersRouter from './routes/admin-banners.js';
import adminBlogRouter from './routes/admin-blog.js';

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  }),
);
app.use(helmet());
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());
app.use(morgan('dev'));

const adminRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: 'RATE_LIMITED', message: 'Too many attempts. Please try again later.' },
  },
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'Deprince Foodmart API is running' });
});

app.use('/api', publicRouter);
app.use('/api/admin', adminRateLimiter, adminRouter);
app.use('/api/admin/settings', adminRateLimiter, adminSettingsRouter);
app.use('/api/admin/banners', adminRateLimiter, adminBannersRouter);
app.use('/api/admin/blog', adminRateLimiter, adminBlogRouter);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);

  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'Something went wrong.',
    },
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
