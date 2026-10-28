# Deployment Guide

## Local development

1. Install Node.js LTS and make sure PostgreSQL is available locally or through Neon/Supabase.
2. From the project root, run `npm install`.
3. Copy the server environment template: `Copy-Item server/.env.example server/.env` (PowerShell).
4. Edit `server/.env`: set `DATABASE_URL`, a private `JWT_SECRET`, and the admin email/password. Set `CLIENT_URL=http://localhost:5173`.
5. From the project root, run `npm run prisma:migrate --workspace server`, then `npm run prisma:seed --workspace server`.
6. Run `npm run dev` from the project root. Open `http://localhost:5173`; admin login is at `http://localhost:5173/admin/login`.
7. Cloudinary credentials are needed for image uploads in admin. Without them, use an existing public image URL; the seeded homepage banner is local and does not require Cloudinary.

## 1. Database
Use Neon or Supabase PostgreSQL.

1. Create a new PostgreSQL database.
2. Copy the connection string into the server `.env` file as `DATABASE_URL`.
3. Run Prisma migrations:
   ```bash
   cd server
   npm install
   npx prisma migrate deploy
   npm run prisma:seed
   ```
4. Create the actual admin account from the seed or change the password immediately after the first login.

## 2. API hosting
Use Render or Railway for the Express app.

Set environment variables:
- `DATABASE_URL`
- `JWT_SECRET`
- `CLIENT_URL`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `NODE_ENV=production`
- `PORT=4000`

Build and deploy the server from the `server` folder.

## 3. Frontend hosting
Use Vercel or Netlify for the client.

Set:
- `VITE_API_URL=https://your-api-domain.com/api`

If the app is served under a custom domain, update the CORS allowlist in the backend.

## 4. CORS and security
- Allow only your deployed client origin.
- Keep secrets only in server environment variables.
- Do not expose admin credentials in browser code.

## 5. Custom domain
Point your domain to the client host and update:
- `CLIENT_ORIGIN`
- sitemap URLs
- robots.txt URLs
- Open Graph metadata

## 6. Final launch checklist
- Database migrated
- Seed run
- Admin password changed
- WhatsApp number verified
- Product images uploaded
- Banner active
- Social links updated
- Homepage loads without errors
- Cart checkout opens WhatsApp correctly
