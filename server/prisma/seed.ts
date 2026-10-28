import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@deprincefoodmart.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMe123!';

  await prisma.setting.upsert({
    where: { id: 1 },
    update: {
      businessName: 'Deprince Foodmart',
      ownerName: 'Deprince Foodmart',
      phone: '08072206245',
      whatsappNumber: '2348072206245',
      email: 'deprincefoodmart@gmail.com',
      address: 'Ajah Shopping Place, Obodo 1, Lagos, Nigeria',
      openingHours: 'Mon-Sat: 8:00am - 8:00pm',
      instagramUrl: 'https://instagram.com',
      facebookUrl: 'https://facebook.com',
      checkoutGreeting: 'Hello Deprince Foodmart, I would like to order the items below:',
    },
    create: {
      id: 1,
      businessName: 'Deprince Foodmart',
      ownerName: 'Deprince Foodmart',
      phone: '08072206245',
      whatsappNumber: '2348072206245',
      email: 'deprincefoodmart@gmail.com',
      address: 'Ajah Shopping Place, Obodo 1, Lagos, Nigeria',
      openingHours: 'Mon-Sat: 8:00am - 8:00pm',
      instagramUrl: 'https://instagram.com',
      facebookUrl: 'https://facebook.com',
      checkoutGreeting: 'Hello Deprince Foodmart, I would like to order the items below:',
    },
  });

  const categories = [
    'Grains & Rice',
    'Oils',
    'Tubers',
    'Vegetables',
    'Provisions',
    'Drinks',
    'Spices',
    'Frozen Foods',
  ];

  const categoryRecords = [] as Array<{ id: string; name: string; slug: string }>;

  for (const [index, name] of categories.entries()) {
    const slug = name.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const record = await prisma.category.upsert({
      where: { slug },
      update: { sortOrder: index },
      create: {
        name,
        slug,
        sortOrder: index,
      },
    });
    categoryRecords.push({ id: record.id, name: record.name, slug: record.slug });
  }

  const bannerList = [
    {
      headline: 'FRESH FOODSTUFF, FAIR PRICES',
      subtext: 'QUALITY GROCERIES, DELIVERED TO YOU\nRice, oil, tubers, fresh produce and more.\nPick your items and order in minutes on WhatsApp.',
      buttonLabel: 'SHOP NOW',
      buttonLink: '/shop',
      imageUrl: '/home-banner.svg',
      sortOrder: 0,
      active: true,
    },
    {
      headline: 'Free Delivery Around Ajah',
      subtext: 'Ask on WhatsApp for same-day availability and order support.',
      buttonLabel: 'Chat on WhatsApp',
      buttonLink: 'https://wa.me/2348072206245',
      imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80',
      sortOrder: 1,
      active: false,
    },
    {
      headline: 'New Arrivals This Week',
      subtext: 'Try fresh produce, grains, and cooking essentials with unbeatable prices.',
      buttonLabel: 'Browse arrivals',
      buttonLink: '/shop',
      imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80',
      sortOrder: 2,
      active: false,
    },
  ];

  for (const banner of bannerList) {
    await prisma.banner.upsert({
      where: {
        id: `banner-${banner.sortOrder}`,
      },
      update: banner,
      create: {
        ...banner,
        id: `banner-${banner.sortOrder}`,
      },
    });
  }

  const productSeed = [
    { name: 'Premium Parboiled Rice', category: 'Grains & Rice', price: 95000, oldPrice: 105000, unit: 'per bag', inStock: true, featured: true },
    { name: 'Vegetable Oil 5L', category: 'Oils', price: 12500, oldPrice: 14000, unit: 'per gallon', inStock: true, featured: true },
    { name: 'Garri White', category: 'Tubers', price: 2800, oldPrice: 3200, unit: 'per paint bucket', inStock: true, featured: false },
    { name: 'Fresh Tomatoes', category: 'Vegetables', price: 1200, oldPrice: 1500, unit: 'per basket', inStock: true, featured: true },
    { name: 'Beans', category: 'Provisions', price: 5100, oldPrice: 5800, unit: 'per bag', inStock: true, featured: false },
    { name: 'Cocoa Drink', category: 'Drinks', price: 2400, oldPrice: 3000, unit: 'per pack', inStock: true, featured: true },
    { name: 'Ground Pepper', category: 'Spices', price: 1700, unit: 'per pack', inStock: true, featured: false },
    { name: 'Whole Chicken', category: 'Frozen Foods', price: 6500, unit: 'per bird', inStock: true, featured: false },
    { name: 'Semo Flour', category: 'Grains & Rice', price: 6500, oldPrice: 7200, unit: 'per bag', inStock: true, featured: true },
    { name: 'Palm Oil', category: 'Oils', price: 9800, oldPrice: 11000, unit: 'per bottle', inStock: true, featured: false },
    { name: 'Yam Tuber', category: 'Tubers', price: 2900, unit: 'per tuber', inStock: true, featured: false },
    { name: 'Green Pepper', category: 'Vegetables', price: 800, unit: 'per basket', inStock: true, featured: false },
    { name: 'Milo', category: 'Drinks', price: 4200, oldPrice: 4900, unit: 'per tin', inStock: true, featured: true },
    { name: 'Thyme', category: 'Spices', price: 1500, oldPrice: 2100, unit: 'per pack', inStock: false, featured: false },
    { name: 'Turkey', category: 'Frozen Foods', price: 8200, unit: 'per bird', inStock: true, featured: false },
  ];

  for (const [index, product] of productSeed.entries()) {
    const category = categoryRecords.find((entry) => entry.name === product.category);
    if (!category) continue;

    await prisma.product.upsert({
      where: { slug: `${product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${index + 1}` },
      update: {
        name: product.name,
        description: `${product.name} is a trusted grocery staple for everyday cooking and family meals.`,
        price: product.price,
        oldPrice: product.oldPrice ?? null,
        unit: product.unit,
        inStock: product.inStock,
        featured: product.featured,
        categoryId: category.id,
      },
      create: {
        name: product.name,
        slug: `${product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${index + 1}`,
        description: `${product.name} is a trusted grocery staple for everyday cooking and family meals.`,
        price: product.price,
        oldPrice: product.oldPrice ?? null,
        unit: product.unit,
        inStock: product.inStock,
        featured: product.featured,
        categoryId: category.id,
        imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
      },
    });
  }

  const blogPosts = [
    {
      title: 'Healthy Grocery Choices for Busy Families',
      excerpt: 'Simple choices that make meal planning easier and more nutritious.',
      body: 'Meal planning becomes easier when you focus on staples ...',
      authorName: 'Deprince Foodmart',
      published: true,
      slug: 'healthy-grocery-choices-for-busy-families',
    },
    {
      title: 'How to Store Fresh Produce Longer',
      excerpt: 'Tips to help you keep fruits and vegetables fresher for longer.',
      body: 'Freshness matters ...',
      authorName: 'Deprince Foodmart',
      published: true,
      slug: 'how-to-store-fresh-produce-longer',
    },
  ];

  for (const post of blogPosts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: post,
      create: {
        ...post,
        coverUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
      },
    });
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.admin.upsert({
    where: { email: adminEmail },
    update: { passwordHash },
    create: { email: adminEmail, passwordHash },
  });

  console.log('Database seeding complete');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
