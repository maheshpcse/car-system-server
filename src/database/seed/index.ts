import { Prisma, PrismaClient, type InteriorMaterial, type Transmission } from '@prisma/client';
import { DEMO_NOTIFICATIONS, DEMO_USERS } from '../../common/constants/index.js';
import { hashPassword } from '../../utils/crypto.js';
import { CATEGORY_SEED, VEHICLE_CATALOG } from './catalog.js';

const prisma = new PrismaClient();

const TRANSMISSION_DB: Record<string, Transmission> = {
  automatic: 'automatic',
  manual: 'manual',
  'single-speed': 'single_speed',
  'dual-clutch': 'dual_clutch',
};

const MATERIAL_DB: Record<string, InteriorMaterial> = {
  fabric: 'fabric',
  leather: 'leather',
  'vegan-leather': 'vegan_leather',
  alcantara: 'alcantara',
};

async function seedUsers() {
  const password = process.env.DEMO_PASSWORD ?? 'demo1234';
  const passwordHash = await hashPassword(password);
  for (const demo of DEMO_USERS) {
    await prisma.user.upsert({
      where: { email: demo.email },
      update: {
        username: demo.username,
        name: demo.name,
        title: demo.title,
        role: demo.role,
        isDemo: true,
        personaId: demo.personaId,
        avatarSeed: demo.avatarSeed,
        location: demo.location,
      },
      create: {
        email: demo.email,
        username: demo.username,
        passwordHash,
        name: demo.name,
        title: demo.title,
        role: demo.role,
        isDemo: true,
        personaId: demo.personaId,
        avatarSeed: demo.avatarSeed,
        location: demo.location,
        createdAt: new Date('2024-03-12T09:00:00.000Z'),
        preferences: { create: {} },
      },
    });
  }
}

async function seedDemoNotifications() {
  const users = await prisma.user.findMany({
    where: { personaId: { in: DEMO_USERS.map((demo) => demo.personaId) } },
  });
  for (const user of users) {
    for (const item of DEMO_NOTIFICATIONS) {
      const createdAt = new Date(Date.now() - item.minutesAgo * 60 * 1000);
      await prisma.notification.upsert({
        where: { id: `n_demo_${user.personaId}_${item.idSuffix}` },
        update: {
          title: item.title,
          body: item.body,
          href: item.href,
          kind: item.kind,
          type: item.type,
        },
        create: {
          id: `n_demo_${user.personaId}_${item.idSuffix}`,
          userId: user.id,
          type: item.type,
          title: item.title,
          body: item.body,
          href: item.href,
          kind: item.kind,
          readAt: item.read ? createdAt : null,
          createdAt,
        },
      });
    }
  }
}

async function seedTaxonomy() {
  for (const category of CATEGORY_SEED) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }

  const brands = [...new Set(VEHICLE_CATALOG.map((v) => v.manufacturer))];
  for (const name of brands) {
    const slug = name.toLowerCase();
    await prisma.brand.upsert({
      where: { slug },
      update: { name },
      create: { slug, name },
    });
  }
}

async function seedVehicles() {
  const brands = await prisma.brand.findMany();
  const categories = await prisma.category.findMany();
  const brandByName = new Map(brands.map((b) => [b.name, b]));
  const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));

  for (const vehicle of VEHICLE_CATALOG) {
    const brand = brandByName.get(vehicle.manufacturer);
    if (!brand) continue;

    await prisma.vehicle.upsert({
      where: { id: vehicle.id },
      update: {
        slug: vehicle.slug,
        brandId: brand.id,
        manufacturer: vehicle.manufacturer,
        model: vehicle.model,
        variant: vehicle.variant,
        year: vehicle.year,
        tagline: vehicle.tagline,
        description: vehicle.description,
        bodyType: vehicle.bodyType,
        fuelType: vehicle.fuelType,
        transmission: TRANSMISSION_DB[vehicle.transmission] ?? 'automatic',
        power: vehicle.power,
        torque: vehicle.torque,
        topSpeed: vehicle.topSpeed,
        acceleration: vehicle.acceleration,
        range: vehicle.range,
        mileage: vehicle.mileage,
        seats: vehicle.seats,
        price: vehicle.price,
        currency: vehicle.currency,
        rating: vehicle.rating,
        isNew: Boolean(vehicle.isNew),
        isFeatured: Boolean(vehicle.isFeatured),
        model3d: vehicle.model3d,
        silhouette: vehicle.silhouette,
        renderMode: vehicle.renderMode,
        renderConfig: (vehicle.renderConfig as Prisma.InputJsonValue | undefined) ?? undefined,
      },
      create: {
        id: vehicle.id,
        slug: vehicle.slug,
        brandId: brand.id,
        manufacturer: vehicle.manufacturer,
        model: vehicle.model,
        variant: vehicle.variant,
        year: vehicle.year,
        tagline: vehicle.tagline,
        description: vehicle.description,
        bodyType: vehicle.bodyType,
        fuelType: vehicle.fuelType,
        transmission: TRANSMISSION_DB[vehicle.transmission] ?? 'automatic',
        power: vehicle.power,
        torque: vehicle.torque,
        topSpeed: vehicle.topSpeed,
        acceleration: vehicle.acceleration,
        range: vehicle.range,
        mileage: vehicle.mileage,
        seats: vehicle.seats,
        price: vehicle.price,
        currency: vehicle.currency,
        rating: vehicle.rating,
        isNew: Boolean(vehicle.isNew),
        isFeatured: Boolean(vehicle.isFeatured),
        model3d: vehicle.model3d,
        silhouette: vehicle.silhouette,
        renderMode: vehicle.renderMode,
        renderConfig: (vehicle.renderConfig as Prisma.InputJsonValue | undefined) ?? undefined,
      },
    });

    await prisma.vehicleSpecification.upsert({
      where: { vehicleId: vehicle.id },
      update: vehicle.dimensions,
      create: { vehicleId: vehicle.id, ...vehicle.dimensions },
    });

    await prisma.vehicleCategory.deleteMany({ where: { vehicleId: vehicle.id } });
    await prisma.vehicleCategory.createMany({
      data: vehicle.category
        .map((slug) => categoryBySlug.get(slug))
        .filter((c): c is NonNullable<typeof c> => Boolean(c))
        .map((category) => ({ vehicleId: vehicle.id, categoryId: category.id })),
    });

    await prisma.vehicleFeature.deleteMany({ where: { vehicleId: vehicle.id } });
    await prisma.vehicleFeature.createMany({
      data: [
        ...vehicle.features.map((label, sortOrder) => ({
          vehicleId: vehicle.id,
          kind: 'FEATURE' as const,
          label,
          sortOrder,
        })),
        ...vehicle.technology.map((label, sortOrder) => ({
          vehicleId: vehicle.id,
          kind: 'TECHNOLOGY' as const,
          label,
          sortOrder,
        })),
        ...vehicle.safety.map((label, sortOrder) => ({
          vehicleId: vehicle.id,
          kind: 'SAFETY' as const,
          label,
          sortOrder,
        })),
      ],
    });

    await prisma.vehicleVariant.deleteMany({ where: { vehicleId: vehicle.id } });
    await prisma.vehicleVariant.createMany({
      data: vehicle.variants.map((variant) => ({
        optionId: variant.id,
        vehicleId: vehicle.id,
        name: variant.name,
        price: variant.price,
        power: variant.power,
        range: variant.range,
        acceleration: variant.acceleration,
        isDefault: variant.name === vehicle.variant,
      })),
    });

    await prisma.vehicleColor.deleteMany({ where: { vehicleId: vehicle.id } });
    await prisma.vehicleColor.createMany({
      data: vehicle.colors.map((item, sortOrder) => ({
        optionId: item.id,
        vehicleId: vehicle.id,
        name: item.name,
        hex: item.hex,
        finish: item.finish,
        price: item.price,
        sortOrder,
      })),
    });

    await prisma.vehicleWheel.deleteMany({ where: { vehicleId: vehicle.id } });
    await prisma.vehicleWheel.createMany({
      data: vehicle.wheels.map((item, sortOrder) => ({
        optionId: item.id,
        vehicleId: vehicle.id,
        name: item.name,
        sizeInches: item.sizeInches,
        style: item.style,
        price: item.price,
        sortOrder,
      })),
    });

    await prisma.vehicleInterior.deleteMany({ where: { vehicleId: vehicle.id } });
    await prisma.vehicleInterior.createMany({
      data: vehicle.interiors.map((item, sortOrder) => ({
        optionId: item.id,
        vehicleId: vehicle.id,
        name: item.name,
        accent: item.accent,
        material: MATERIAL_DB[item.material] ?? 'fabric',
        price: item.price,
        sortOrder,
      })),
    });

    await prisma.vehicleTrim.deleteMany({ where: { vehicleId: vehicle.id } });
    await prisma.vehicleTrim.createMany({
      data: vehicle.trims.map((item, sortOrder) => ({
        optionId: item.id,
        vehicleId: vehicle.id,
        name: item.name,
        description: item.description,
        price: item.price,
        sortOrder,
      })),
    });

    await prisma.vehicleAccessory.deleteMany({ where: { vehicleId: vehicle.id } });
    await prisma.vehicleAccessory.createMany({
      data: vehicle.accessories.map((item, sortOrder) => ({
        optionId: item.id,
        vehicleId: vehicle.id,
        name: item.name,
        description: item.description,
        price: item.price,
        sortOrder,
      })),
    });
  }
}

async function main() {
  await seedUsers();
  await seedDemoNotifications();
  await seedTaxonomy();
  await seedVehicles();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
