# Final QA Checklist

## Site basics
- [ ] Homepage loads correctly on desktop and mobile.
- [ ] Shop page loads products and filters work.
- [ ] Product detail page shows price, stock, description, and image.
- [ ] Blog list loads and blog detail pages open correctly.
- [ ] Contact page shows current business info from Settings.

## Cart and checkout
- [ ] Add to cart works from home, shop, and product pages.
- [ ] Quantity changes and remove actions work correctly.
- [ ] Cart persists after refresh.
- [ ] Checkout opens WhatsApp with text-only order details.
- [ ] Customer name is required before checkout.
- [ ] Empty cart blocks checkout.
- [ ] Out-of-stock items are blocked or clearly flagged.

## Admin tasks
- [ ] Admin login works.
- [ ] Product CRUD works.
- [ ] Category CRUD works.
- [ ] Banner CRUD works.
- [ ] Blog post create/edit/delete works.
- [ ] Settings save correctly and reflect publicly.
- [ ] WhatsApp number updates across the site.

## PWA and SEO
- [ ] Manifest loads with proper install prompt.
- [ ] Service worker caches app shell and recent API responses.
- [ ] Offline fallback loads gracefully.
- [ ] Page titles and meta descriptions update correctly.
- [ ] Sitemap and robots.txt are live.
- [ ] Structured data is injected on relevant pages.

## Final launch
- [ ] Database is migrated and seeded.
- [ ] Admin password changed from the default.
- [ ] All env vars are set.
- [ ] CORS is restricted to the right domains.
- [ ] No secrets are committed to the repo.
- [ ] Deployment is tested on the real domain.
