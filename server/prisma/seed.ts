import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123456', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@adopalmwinery.com' },
    update: {},
    create: {
      email: 'admin@adopalmwinery.com',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    },
  });
  console.log('Admin user created:', admin.email);

  // Create demo customer
  const customerPassword = await bcrypt.hash('customer123', 12);
  const customer = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      passwordHash: customerPassword,
      firstName: 'Demo',
      lastName: 'Customer',
      role: 'CUSTOMER',
      phone: '+1234567890',
    },
  });

  // Create address for demo customer
  await prisma.address.upsert({
    where: { id: 'demo-address-1' },
    update: {},
    create: {
      id: 'demo-address-1',
      userId: customer.id,
      label: 'Home',
      firstName: 'Demo',
      lastName: 'Customer',
      street: '123 Palm Avenue',
      city: 'Miami',
      state: 'FL',
      postalCode: '33101',
      country: 'US',
      phone: '+1234567890',
      isDefault: true,
    },
  });

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'palm-wine' },
      update: {},
      create: {
        name: 'Palm Wine',
        nameEs: 'Vino de Palma',
        slug: 'palm-wine',
        description: 'Traditional palm wine, freshly tapped and naturally fermented from the sap of palm trees.',
        descriptionEs: 'Vino de palma tradicional, recien extraido y fermentado naturalmente de la savia de las palmeras.',
        sortOrder: 1,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'palm-oil' },
      update: {},
      create: {
        name: 'Palm Oil',
        nameEs: 'Aceite de Palma',
        slug: 'palm-oil',
        description: 'Premium quality red palm oil, cold-pressed and unrefined for maximum nutrition.',
        descriptionEs: 'Aceite de palma rojo de primera calidad, prensado en frio y sin refinar para maxima nutricion.',
        sortOrder: 2,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'palm-spirits' },
      update: {},
      create: {
        name: 'Palm Spirits',
        nameEs: 'Licores de Palma',
        slug: 'palm-spirits',
        description: 'Distilled palm-based spirits and liqueurs, crafted with centuries-old traditions.',
        descriptionEs: 'Licores y destilados a base de palma, elaborados con tradiciones centenarias.',
        sortOrder: 3,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'palm-accessories' },
      update: {},
      create: {
        name: 'Accessories',
        nameEs: 'Accesorios',
        slug: 'palm-accessories',
        description: 'Traditional calabash cups, serving sets, and palm wine accessories.',
        descriptionEs: 'Tazas de calabaza tradicionales, juegos de servir y accesorios para vino de palma.',
        sortOrder: 4,
      },
    }),
  ]);

  console.log(`Created ${categories.length} categories`);

  // Create products
  const products = await Promise.all([
    // Palm Wine
    prisma.product.upsert({
      where: { slug: 'fresh-palm-wine-1l' },
      update: {},
      create: {
        name: 'Fresh Palm Wine - 1L',
        nameEs: 'Vino de Palma Fresco - 1L',
        slug: 'fresh-palm-wine-1l',
        description: 'Our signature fresh palm wine, tapped daily from select palm trees. Sweet, mildly effervescent, and packed with natural probiotics. Best enjoyed chilled within 48 hours.',
        descriptionEs: 'Nuestro vino de palma fresco emblematico, extraido diariamente de palmeras selectas. Dulce, ligeramente efervescente y lleno de probioticos naturales. Mejor disfrutar frio dentro de 48 horas.',
        priceUSD: 24.99,
        priceEUR: 22.99,
        priceGBP: 19.99,
        compareAtUSD: 29.99,
        images: ['/images/products/fresh-palm-wine-1l.jpg'],
        categoryId: categories[0].id,
        sku: 'PW-FRESH-1L',
        stock: 100,
        weight: 1.2,
        isFeatured: true,
        tags: ['fresh', 'bestseller', 'probiotic'],
      },
    }),
    prisma.product.upsert({
      where: { slug: 'fresh-palm-wine-5l' },
      update: {},
      create: {
        name: 'Fresh Palm Wine - 5L Party Pack',
        nameEs: 'Vino de Palma Fresco - 5L Pack Fiesta',
        slug: 'fresh-palm-wine-5l',
        description: 'Perfect for gatherings! Five liters of our fresh palm wine in a convenient dispenser pack. Serves 10-15 people.',
        descriptionEs: 'Perfecto para reuniones! Cinco litros de nuestro vino de palma fresco en un practico dispensador. Sirve 10-15 personas.',
        priceUSD: 89.99,
        priceEUR: 82.99,
        priceGBP: 72.99,
        images: ['/images/products/fresh-palm-wine-5l.jpg'],
        categoryId: categories[0].id,
        sku: 'PW-FRESH-5L',
        stock: 50,
        weight: 5.5,
        isFeatured: true,
        tags: ['fresh', 'party', 'value'],
      },
    }),
    prisma.product.upsert({
      where: { slug: 'aged-palm-wine-750ml' },
      update: {},
      create: {
        name: 'Aged Palm Wine Reserve - 750ml',
        nameEs: 'Reserva de Vino de Palma Envejecido - 750ml',
        slug: 'aged-palm-wine-750ml',
        description: 'A premium aged palm wine with complex flavors developed over weeks of controlled fermentation. Notes of honey, citrus, and tropical fruit.',
        descriptionEs: 'Un vino de palma envejecido premium con sabores complejos desarrollados durante semanas de fermentacion controlada. Notas de miel, citricos y frutas tropicales.',
        priceUSD: 39.99,
        priceEUR: 36.99,
        priceGBP: 32.99,
        images: ['/images/products/aged-palm-wine-750ml.jpg'],
        categoryId: categories[0].id,
        sku: 'PW-AGED-750',
        stock: 75,
        weight: 1.0,
        isFeatured: true,
        tags: ['aged', 'premium', 'reserve'],
      },
    }),
    // Palm Oil
    prisma.product.upsert({
      where: { slug: 'red-palm-oil-500ml' },
      update: {},
      create: {
        name: 'Virgin Red Palm Oil - 500ml',
        nameEs: 'Aceite de Palma Rojo Virgen - 500ml',
        slug: 'red-palm-oil-500ml',
        description: 'Cold-pressed, unrefined red palm oil rich in vitamins A and E. Perfect for West African cuisine, stews, and traditional cooking.',
        descriptionEs: 'Aceite de palma rojo prensado en frio, sin refinar, rico en vitaminas A y E. Perfecto para cocina de Africa Occidental, guisos y cocina tradicional.',
        priceUSD: 18.99,
        priceEUR: 17.49,
        priceGBP: 15.49,
        images: ['/images/products/red-palm-oil-500ml.jpg'],
        categoryId: categories[1].id,
        sku: 'PO-RED-500',
        stock: 200,
        weight: 0.6,
        isFeatured: true,
        tags: ['organic', 'cold-pressed', 'cooking'],
      },
    }),
    prisma.product.upsert({
      where: { slug: 'red-palm-oil-1l' },
      update: {},
      create: {
        name: 'Virgin Red Palm Oil - 1L',
        nameEs: 'Aceite de Palma Rojo Virgen - 1L',
        slug: 'red-palm-oil-1l',
        description: 'Our best-selling palm oil in a larger size. Sustainably sourced, cold-pressed, and packed with nutrients.',
        descriptionEs: 'Nuestro aceite de palma mas vendido en tamano grande. De origen sostenible, prensado en frio y lleno de nutrientes.',
        priceUSD: 32.99,
        priceEUR: 29.99,
        priceGBP: 26.99,
        images: ['/images/products/red-palm-oil-1l.jpg'],
        categoryId: categories[1].id,
        sku: 'PO-RED-1L',
        stock: 150,
        weight: 1.1,
        tags: ['organic', 'cold-pressed', 'value'],
      },
    }),
    // Palm Spirits
    prisma.product.upsert({
      where: { slug: 'palm-wine-brandy-700ml' },
      update: {},
      create: {
        name: 'Palm Wine Brandy - 700ml',
        nameEs: 'Brandy de Vino de Palma - 700ml',
        slug: 'palm-wine-brandy-700ml',
        description: 'A smooth, aromatic brandy distilled from palm wine. Aged in oak barrels for a rich, complex flavor profile. 40% ABV.',
        descriptionEs: 'Un brandy suave y aromatico destilado de vino de palma. Envejecido en barricas de roble para un perfil de sabor rico y complejo. 40% ABV.',
        priceUSD: 54.99,
        priceEUR: 49.99,
        priceGBP: 44.99,
        images: ['/images/products/palm-wine-brandy-700ml.jpg'],
        categoryId: categories[2].id,
        sku: 'PS-BRANDY-700',
        stock: 40,
        weight: 1.0,
        isFeatured: true,
        tags: ['spirit', 'brandy', 'premium'],
      },
    }),
    prisma.product.upsert({
      where: { slug: 'ogogoro-premium-500ml' },
      update: {},
      create: {
        name: 'Ogogoro Premium - 500ml',
        nameEs: 'Ogogoro Premium - 500ml',
        slug: 'ogogoro-premium-500ml',
        description: 'Traditional Nigerian spirit distilled from fermented palm wine. A cultural classic, smooth with a warm finish. 45% ABV.',
        descriptionEs: 'Licor nigeriano tradicional destilado de vino de palma fermentado. Un clasico cultural, suave con un final calido. 45% ABV.',
        priceUSD: 42.99,
        priceEUR: 39.99,
        priceGBP: 34.99,
        images: ['/images/products/ogogoro-premium-500ml.jpg'],
        categoryId: categories[2].id,
        sku: 'PS-OGOG-500',
        stock: 60,
        weight: 0.8,
        tags: ['spirit', 'traditional', 'ogogoro'],
      },
    }),
    // Accessories
    prisma.product.upsert({
      where: { slug: 'calabash-cup-set' },
      update: {},
      create: {
        name: 'Traditional Calabash Cup Set (4 pcs)',
        nameEs: 'Juego de Tazas de Calabaza Tradicional (4 pzs)',
        slug: 'calabash-cup-set',
        description: 'Authentic hand-carved calabash cups, the traditional way to enjoy palm wine. Set of 4 cups, each uniquely crafted.',
        descriptionEs: 'Autenticas tazas de calabaza talladas a mano, la forma tradicional de disfrutar el vino de palma. Juego de 4 tazas, cada una hecha a mano.',
        priceUSD: 34.99,
        priceEUR: 31.99,
        priceGBP: 28.99,
        images: ['/images/products/calabash-cup-set.jpg'],
        categoryId: categories[3].id,
        sku: 'ACC-CALAB-4',
        stock: 80,
        weight: 0.5,
        isFeatured: true,
        tags: ['accessory', 'traditional', 'handmade'],
      },
    }),
  ]);

  console.log(`Created ${products.length} products`);

  // Create shipping zones
  const zones = await Promise.all([
    prisma.shippingZone.create({
      data: {
        name: 'United States',
        countries: ['US'],
        baseCost: 9.99,
        perKgCost: 2.50,
        currency: 'USD',
        estimatedDays: '3-5 business days',
      },
    }),
    prisma.shippingZone.create({
      data: {
        name: 'Canada',
        countries: ['CA'],
        baseCost: 14.99,
        perKgCost: 3.50,
        currency: 'USD',
        estimatedDays: '5-7 business days',
      },
    }),
    prisma.shippingZone.create({
      data: {
        name: 'United Kingdom',
        countries: ['GB'],
        baseCost: 12.99,
        perKgCost: 3.00,
        currency: 'GBP',
        estimatedDays: '7-10 business days',
      },
    }),
    prisma.shippingZone.create({
      data: {
        name: 'European Union',
        countries: ['DE', 'FR', 'ES', 'IT', 'NL', 'BE', 'PT', 'AT', 'IE', 'FI', 'GR'],
        baseCost: 14.99,
        perKgCost: 3.50,
        currency: 'EUR',
        estimatedDays: '7-12 business days',
      },
    }),
    prisma.shippingZone.create({
      data: {
        name: 'Mexico & Central America',
        countries: ['MX', 'GT', 'BZ', 'HN', 'SV', 'NI', 'CR', 'PA'],
        baseCost: 19.99,
        perKgCost: 4.50,
        currency: 'USD',
        estimatedDays: '10-15 business days',
      },
    }),
  ]);

  console.log(`Created ${zones.length} shipping zones`);
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
