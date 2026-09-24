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
      where: { slug: 'vino-de-coyol' },
      update: {},
      create: {
        name: 'Vino de Coyol',
        nameEs: 'Vino de Coyol',
        slug: 'vino-de-coyol',
        description: 'Our flagship naturally fermented palm sap wine — sweet, earthy, and probiotic. A national heritage of Costa Rica, perfected since 1979.',
        descriptionEs: 'Nuestro vino insignia de savia de palma fermentada naturalmente — dulce, terroso y probiotico. Patrimonio nacional de Costa Rica, perfeccionado desde 1979.',
        sortOrder: 1,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'fruit-infusions' },
      update: {},
      create: {
        name: 'Fruit Infusions',
        nameEs: 'Infusiones de Frutas',
        slug: 'fruit-infusions',
        description: 'Fruit-infused Vino de Coyol — craft expressions blended with pure tropical fruit.',
        descriptionEs: 'Vino de Coyol infusionado con frutas — expresiones artesanales mezcladas con fruta tropical pura.',
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
        description: 'Distilled palm-based spirits crafted from our Vino de Coyol.',
        descriptionEs: 'Licores destilados a base de palma elaborados de nuestro Vino de Coyol.',
        sortOrder: 3,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'cocktails' },
      update: {},
      create: {
        name: 'Cocktails',
        nameEs: 'Cocteles',
        slug: 'cocktails',
        description: 'Signature ready-to-serve beachside cocktails.',
        descriptionEs: 'Cocteles de playa exclusivos listos para servir.',
        sortOrder: 4,
      },
    }),
  ]);

  console.log(`Created ${categories.length} categories`);

  // Create products — real Ado Palm Winery lineup
  const products = await Promise.all([
    // Vino de Coyol
    prisma.product.upsert({
      where: { slug: 'vino-de-coyol-original' },
      update: {},
      create: {
        name: 'Vino de Coyol Original - Pack of 24',
        nameEs: 'Vino de Coyol Original - Paquete de 24',
        slug: 'vino-de-coyol-original',
        description: 'Our flagship natural palm sap wine — sweet, earthy, and probiotic, crafted from naturally fermented palm sap. A national heritage of Costa Rica, perfected since 1979. 4% ABV. Best enjoyed chilled.',
        descriptionEs: 'Nuestro vino de savia de palma insignia — dulce, terroso y probiotico, elaborado de savia de palma fermentada naturalmente. Patrimonio nacional de Costa Rica, perfeccionado desde 1979. 4% ABV. Mejor disfrutar frio.',
        priceUSD: 85,
        priceEUR: 78,
        priceGBP: 67,
        priceCRC: 42500,
        images: ['/images/products/vino-de-coyol-original.jpg'],
        categoryId: categories[0].id,
        sku: 'VC-ORIG-24',
        stock: 100,
        weight: 10,
        isFeatured: true,
        tags: ['flagship', 'probiotic', 'bestseller'],
      },
    }),
    prisma.product.upsert({
      where: { slug: 'vino-de-coyol-non-alcoholic' },
      update: {},
      create: {
        name: 'Vino de Coyol Non-Alcoholic - Pack of 24',
        nameEs: 'Vino de Coyol Sin Alcohol - Paquete de 24',
        slug: 'vino-de-coyol-non-alcoholic',
        description: 'All the sweet, earthy flavor of our natural palm sap wine with 0% alcohol. All-natural and probiotic — the taste of Costa Rica for everyone.',
        descriptionEs: 'Todo el sabor dulce y terroso de nuestro vino de savia de palma con 0% de alcohol. Totalmente natural y probiotico — el sabor de Costa Rica para todos.',
        priceUSD: 85,
        priceEUR: 78,
        priceGBP: 67,
        priceCRC: 42500,
        images: ['/images/products/vino-de-coyol-non-alcoholic.jpg'],
        categoryId: categories[0].id,
        sku: 'VC-NA-24',
        stock: 100,
        weight: 10,
        tags: ['non-alcoholic', 'probiotic'],
      },
    }),
    // Fruit Infusions
    prisma.product.upsert({
      where: { slug: 'vino-de-coyol-pineapple' },
      update: {},
      create: {
        name: 'Vino de Coyol Pineapple - Pack of 24',
        nameEs: 'Vino de Coyol Pina - Paquete de 24',
        slug: 'vino-de-coyol-pineapple',
        description: 'Natural palm sap wine infused with pure pineapple — smooth, sweet, and unmistakably tropical. 4% ABV. All-natural and probiotic.',
        descriptionEs: 'Vino de savia de palma natural infusionado con pina pura — suave, dulce e inconfundiblemente tropical. 4% ABV. Totalmente natural y probiotico.',
        priceUSD: 85,
        priceEUR: 78,
        priceGBP: 67,
        priceCRC: 42500,
        images: ['/images/products/vino-de-coyol-pineapple.jpg'],
        categoryId: categories[1].id,
        sku: 'VC-PINE-24',
        stock: 100,
        weight: 10,
        tags: ['pineapple', 'infusion', 'tropical'],
      },
    }),
    prisma.product.upsert({
      where: { slug: 'vino-de-coyol-mango' },
      update: {},
      create: {
        name: 'Vino de Coyol Mango - Pack of 24',
        nameEs: 'Vino de Coyol Mango - Paquete de 24',
        slug: 'vino-de-coyol-mango',
        description: 'Natural palm sap wine infused with pure mango — rich, juicy, and tropical. 4% ABV. All-natural and probiotic.',
        descriptionEs: 'Vino de savia de palma natural infusionado con mango puro — rico, jugoso y tropical. 4% ABV. Totalmente natural y probiotico.',
        priceUSD: 85,
        priceEUR: 78,
        priceGBP: 67,
        priceCRC: 42500,
        images: ['/images/products/vino-de-coyol-mango.jpg'],
        categoryId: categories[1].id,
        sku: 'VC-MANGO-24',
        stock: 100,
        weight: 10,
        tags: ['mango', 'infusion', 'tropical'],
      },
    }),
    prisma.product.upsert({
      where: { slug: 'vino-de-coyol-passion-fruit' },
      update: {},
      create: {
        name: 'Vino de Coyol Passion Fruit - Pack of 24',
        nameEs: 'Vino de Coyol Maracuya - Paquete de 24',
        slug: 'vino-de-coyol-passion-fruit',
        description: 'Natural palm sap wine infused with pure passion fruit — a bright, tropical twist on the classic. 4% ABV. All-natural and probiotic.',
        descriptionEs: 'Vino de savia de palma natural infusionado con maracuya pura — un giro tropical y vibrante del clasico. 4% ABV. Totalmente natural y probiotico.',
        priceUSD: 85,
        priceEUR: 78,
        priceGBP: 67,
        priceCRC: 42500,
        images: ['/images/products/vino-de-coyol-passion-fruit.jpg'],
        categoryId: categories[1].id,
        sku: 'VC-PASS-24',
        stock: 100,
        weight: 10,
        isFeatured: true,
        tags: ['passion fruit', 'infusion', 'tropical'],
      },
    }),
    // Palm Spirits
    prisma.product.upsert({
      where: { slug: 'el-fuego-de-coyol' },
      update: {},
      create: {
        name: 'El Fuego de Coyol Palm Gin - Pack of 2',
        nameEs: 'Gin de Palma El Fuego de Coyol - Paquete de 2',
        slug: 'el-fuego-de-coyol',
        description: 'A smooth palm gin distilled from our Vino de Coyol — bold character with a warm finish. 35% ABV. The fire behind our signature cocktails.',
        descriptionEs: 'Un gin de palma suave destilado de nuestro Vino de Coyol — caracter audaz con un final calido. 35% ABV. El fuego detras de nuestros cocteles insignia.',
        priceUSD: 49,
        priceEUR: 45,
        priceGBP: 39,
        priceCRC: 24500,
        images: ['/images/products/el-fuego-de-coyol.jpg'],
        categoryId: categories[2].id,
        sku: 'EF-GIN-2',
        stock: 80,
        weight: 2.4,
        isFeatured: true,
        tags: ['spirit', 'gin', 'premium'],
      },
    }),
    // Sunset Cocktails
    prisma.product.upsert({
      where: { slug: 'pineapple-sunset-cocktail' },
      update: {},
      create: {
        name: 'Pineapple Sunset Cocktail - Pack of 24',
        nameEs: 'Coctel Pineapple Sunset - Paquete de 24',
        slug: 'pineapple-sunset-cocktail',
        description: 'Our signature ready-to-serve beachside cocktail — pineapple-infused Vino de Coyol blended with El Fuego de Coyol palm gin. 14% ABV. Pour over ice and own the sunset.',
        descriptionEs: 'Nuestro coctel de playa insignia listo para servir — Vino de Coyol infusionado con pina mezclado con gin de palma El Fuego de Coyol. 14% ABV. Servir sobre hielo y conquista el atardecer.',
        priceUSD: 85,
        priceEUR: 78,
        priceGBP: 67,
        priceCRC: 42500,
        images: ['/images/products/pineapple-sunset-cocktail.jpg'],
        categoryId: categories[3].id,
        sku: 'CT-PINE-24',
        stock: 100,
        weight: 10,
        isFeatured: true,
        tags: ['cocktail', 'signature', 'pineapple'],
      },
    }),
    prisma.product.upsert({
      where: { slug: 'mango-sunset-cocktail' },
      update: {},
      create: {
        name: 'Mango Sunset Cocktail - Pack of 24',
        nameEs: 'Coctel Mango Sunset - Paquete de 24',
        slug: 'mango-sunset-cocktail',
        description: 'Ready-to-serve beachside cocktail — mango-infused Vino de Coyol blended with El Fuego de Coyol palm gin. 14% ABV. Pour over ice and own the sunset.',
        descriptionEs: 'Coctel de playa listo para servir — Vino de Coyol infusionado con mango mezclado con gin de palma El Fuego de Coyol. 14% ABV. Servir sobre hielo y conquista el atardecer.',
        priceUSD: 96,
        priceEUR: 88,
        priceGBP: 76,
        priceCRC: 48000,
        images: ['/images/products/mango-sunset-cocktail.jpg'],
        categoryId: categories[3].id,
        sku: 'CT-MANGO-24',
        stock: 100,
        weight: 10,
        tags: ['cocktail', 'signature', 'mango'],
      },
    }),
    prisma.product.upsert({
      where: { slug: 'passion-fruit-sunset-cocktail' },
      update: {},
      create: {
        name: 'Passion Fruit Sunset Cocktail - Pack of 24',
        nameEs: 'Coctel Passion Fruit Sunset - Paquete de 24',
        slug: 'passion-fruit-sunset-cocktail',
        description: 'Ready-to-serve beachside cocktail — passion fruit-infused Vino de Coyol blended with El Fuego de Coyol palm gin. 14% ABV. Pour over ice and own the sunset.',
        descriptionEs: 'Coctel de playa listo para servir — Vino de Coyol infusionado con maracuya mezclado con gin de palma El Fuego de Coyol. 14% ABV. Servir sobre hielo y conquista el atardecer.',
        priceUSD: 96,
        priceEUR: 88,
        priceGBP: 76,
        priceCRC: 48000,
        images: ['/images/products/passion-fruit-sunset-cocktail.jpg'],
        categoryId: categories[3].id,
        sku: 'CT-PASS-24',
        stock: 100,
        weight: 10,
        tags: ['cocktail', 'signature', 'passion fruit'],
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
        name: 'Costa Rica',
        countries: ['CR'],
        baseCost: 8500,
        perKgCost: 2100,
        currency: 'CRC',
        estimatedDays: '7-10 business days',
      },
    }),
    prisma.shippingZone.create({
      data: {
        name: 'Mexico & Central America',
        countries: ['MX', 'GT', 'BZ', 'HN', 'SV', 'NI', 'PA'],
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
