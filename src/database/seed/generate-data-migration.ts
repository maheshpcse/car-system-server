import { writeFileSync, mkdirSync } from 'node:fs';
import { hashSync } from 'bcryptjs';
import { DEMO_USERS } from '../../common/constants/index.js';
import { CATEGORY_SEED, VEHICLE_CATALOG } from './catalog.js';

const TRANSMISSION: Record<string, string> = {
  automatic: 'automatic',
  manual: 'manual',
  'single-speed': 'single_speed',
  'dual-clutch': 'dual_clutch',
};

const MATERIAL: Record<string, string> = {
  fabric: 'fabric',
  leather: 'leather',
  'vegan-leather': 'vegan_leather',
  alcantara: 'alcantara',
};

const sql = (value: string | number | boolean | null) => {
  if (value === null) return 'NULL';
  if (typeof value === 'boolean') return value ? '1' : '0';
  if (typeof value === 'number') return String(value);
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "''")}'`;
};

const lines: string[] = [
  '-- Data migration: Aurora Motors catalogue + demo personas.',
  '-- Source: frontend src/data/vehicles.ts and src/data/personas.ts',
  '-- Password for every demo account: demo1234',
  '',
];

const passwordHash = hashSync(process.env.DEMO_PASSWORD ?? 'demo1234', 12);
const brands = [...new Set(VEHICLE_CATALOG.map((v) => v.manufacturer))].sort();

lines.push('-- Brands');
for (const name of brands) {
  const id = `brand_${name.toLowerCase()}`;
  const slug = name.toLowerCase();
  lines.push(
    `INSERT INTO \`brands\` (\`id\`, \`slug\`, \`name\`, \`description\`, \`created_at\`, \`updated_at\`) VALUES (${sql(id)}, ${sql(slug)}, ${sql(name)}, NULL, NOW(3), NOW(3));`,
  );
}
lines.push('');

lines.push('-- Categories');
for (const category of CATEGORY_SEED) {
  const id = `cat_${category.slug}`;
  lines.push(
    `INSERT INTO \`vehicle_categories\` (\`id\`, \`slug\`, \`label\`, \`description\`, \`icon\`, \`sort_order\`) VALUES (${sql(id)}, ${sql(category.slug)}, ${sql(category.label)}, ${sql(category.description)}, ${sql(category.icon)}, ${category.sortOrder});`,
  );
}
lines.push('');

for (const vehicle of VEHICLE_CATALOG) {
  const brandId = `brand_${vehicle.manufacturer.toLowerCase()}`;
  const renderConfig = JSON.stringify(vehicle.renderConfig ?? { silhouette: vehicle.silhouette });
  lines.push(`-- Vehicle ${vehicle.id}`);
  lines.push(
    `INSERT INTO \`vehicles\` (\`id\`, \`slug\`, \`brand_id\`, \`manufacturer\`, \`model\`, \`variant\`, \`year\`, \`tagline\`, \`description\`, \`body_type\`, \`fuel_type\`, \`transmission\`, \`power\`, \`torque\`, \`top_speed\`, \`acceleration\`, \`range\`, \`mileage\`, \`seats\`, \`price\`, \`currency\`, \`rating\`, \`is_new\`, \`is_featured\`, \`is_published\`, \`model_3d\`, \`silhouette\`, \`render_mode\`, \`render_config\`, \`created_at\`, \`updated_at\`) VALUES (${sql(vehicle.id)}, ${sql(vehicle.slug)}, ${sql(brandId)}, ${sql(vehicle.manufacturer)}, ${sql(vehicle.model)}, ${sql(vehicle.variant)}, ${vehicle.year}, ${sql(vehicle.tagline)}, ${sql(vehicle.description)}, ${sql(vehicle.bodyType)}, ${sql(vehicle.fuelType)}, ${sql(TRANSMISSION[vehicle.transmission] ?? 'automatic')}, ${vehicle.power}, ${vehicle.torque}, ${vehicle.topSpeed}, ${vehicle.acceleration}, ${vehicle.range}, ${vehicle.mileage === null ? 'NULL' : vehicle.mileage}, ${vehicle.seats}, ${vehicle.price}, ${sql(vehicle.currency)}, ${vehicle.rating}, ${sql(Boolean(vehicle.isNew))}, ${sql(Boolean(vehicle.isFeatured))}, 1, NULL, ${sql(vehicle.silhouette)}, ${sql(vehicle.renderMode)}, ${sql(renderConfig)}, NOW(3), NOW(3));`,
  );
  lines.push(
    `INSERT INTO \`vehicle_specifications\` (\`id\`, \`vehicle_id\`, \`length_mm\`, \`width_mm\`, \`height_mm\`, \`wheelbase_mm\`, \`cargo_liters\`, \`weight_kg\`) VALUES (${sql(`spec_${vehicle.id}`)}, ${sql(vehicle.id)}, ${vehicle.dimensions.lengthMm}, ${vehicle.dimensions.widthMm}, ${vehicle.dimensions.heightMm}, ${vehicle.dimensions.wheelbaseMm}, ${vehicle.dimensions.cargoLiters}, ${vehicle.dimensions.weightKg});`,
  );
  for (const slug of vehicle.category) {
    lines.push(
      `INSERT INTO \`vehicle_category_links\` (\`vehicle_id\`, \`category_id\`) VALUES (${sql(vehicle.id)}, ${sql(`cat_${slug}`)});`,
    );
  }
  const featureGroups = [
    ['FEATURE', vehicle.features],
    ['TECHNOLOGY', vehicle.technology],
    ['SAFETY', vehicle.safety],
  ] as const;
  for (const [kind, labels] of featureGroups) {
    labels.forEach((label, index) => {
      lines.push(
        `INSERT INTO \`vehicle_features\` (\`id\`, \`vehicle_id\`, \`kind\`, \`label\`, \`sort_order\`) VALUES (${sql(`feat_${vehicle.id}_${kind.toLowerCase()}_${index}`)}, ${sql(vehicle.id)}, ${sql(kind)}, ${sql(label)}, ${index});`,
      );
    });
  }
  for (const variant of vehicle.variants) {
    lines.push(
      `INSERT INTO \`vehicle_variants\` (\`id\`, \`option_id\`, \`vehicle_id\`, \`name\`, \`price\`, \`power\`, \`range\`, \`acceleration\`, \`is_default\`, \`available\`) VALUES (${sql(`var_${vehicle.id}_${variant.id}`)}, ${sql(variant.id)}, ${sql(vehicle.id)}, ${sql(variant.name)}, ${variant.price}, ${variant.power}, ${variant.range}, ${variant.acceleration}, ${sql(variant.name === vehicle.variant)}, 1);`,
    );
  }
  vehicle.colors.forEach((item, index) => {
    lines.push(
      `INSERT INTO \`vehicle_colors\` (\`id\`, \`option_id\`, \`vehicle_id\`, \`name\`, \`hex\`, \`finish\`, \`price\`, \`available\`, \`sort_order\`) VALUES (${sql(`col_${vehicle.id}_${item.id}`)}, ${sql(item.id)}, ${sql(vehicle.id)}, ${sql(item.name)}, ${sql(item.hex)}, ${sql(item.finish)}, ${item.price}, 1, ${index});`,
    );
  });
  vehicle.wheels.forEach((item, index) => {
    lines.push(
      `INSERT INTO \`vehicle_wheels\` (\`id\`, \`option_id\`, \`vehicle_id\`, \`name\`, \`size_inches\`, \`style\`, \`price\`, \`available\`, \`sort_order\`) VALUES (${sql(`whl_${vehicle.id}_${item.id}`)}, ${sql(item.id)}, ${sql(vehicle.id)}, ${sql(item.name)}, ${item.sizeInches}, ${sql(item.style)}, ${item.price}, 1, ${index});`,
    );
  });
  vehicle.interiors.forEach((item, index) => {
    lines.push(
      `INSERT INTO \`vehicle_interiors\` (\`id\`, \`option_id\`, \`vehicle_id\`, \`name\`, \`accent\`, \`material\`, \`price\`, \`available\`, \`sort_order\`) VALUES (${sql(`int_${vehicle.id}_${item.id}`)}, ${sql(item.id)}, ${sql(vehicle.id)}, ${sql(item.name)}, ${sql(item.accent)}, ${sql(MATERIAL[item.material] ?? 'fabric')}, ${item.price}, 1, ${index});`,
    );
  });
  vehicle.trims.forEach((item, index) => {
    lines.push(
      `INSERT INTO \`vehicle_trims\` (\`id\`, \`option_id\`, \`vehicle_id\`, \`name\`, \`description\`, \`price\`, \`available\`, \`sort_order\`) VALUES (${sql(`trm_${vehicle.id}_${item.id}`)}, ${sql(item.id)}, ${sql(vehicle.id)}, ${sql(item.name)}, ${sql(item.description)}, ${item.price}, 1, ${index});`,
    );
  });
  vehicle.accessories.forEach((item, index) => {
    lines.push(
      `INSERT INTO \`vehicle_accessories\` (\`id\`, \`option_id\`, \`vehicle_id\`, \`name\`, \`description\`, \`price\`, \`available\`, \`sort_order\`) VALUES (${sql(`acc_${vehicle.id}_${item.id}`)}, ${sql(item.id)}, ${sql(vehicle.id)}, ${sql(item.name)}, ${sql(item.description)}, ${item.price}, 1, ${index});`,
    );
  });
  lines.push('');
}

lines.push('-- Demo users (password: demo1234)');
for (const demo of DEMO_USERS) {
  const id = `usr_demo_${demo.personaId}`;
  const prefId = `pref_${demo.personaId}`;
  const [first, ...rest] = demo.name.split(' ');
  lines.push(
    `INSERT INTO \`users\` (\`id\`, \`email\`, \`password_hash\`, \`name\`, \`first_name\`, \`last_name\`, \`display_name\`, \`title\`, \`role\`, \`avatar_seed\`, \`location\`, \`is_demo\`, \`is_active\`, \`persona_id\`, \`created_at\`, \`updated_at\`) VALUES (${sql(id)}, ${sql(demo.email)}, ${sql(passwordHash)}, ${sql(demo.name)}, ${sql(first ?? demo.name)}, ${sql(rest.join(' ') || null)}, ${sql(demo.name)}, ${sql(demo.title)}, ${sql(demo.role)}, ${demo.avatarSeed}, ${sql(demo.location)}, 1, 1, ${sql(demo.personaId)}, '2024-03-12 09:00:00.000', NOW(3));`,
  );
  lines.push(
    `INSERT INTO \`user_preferences\` (\`id\`, \`user_id\`, \`theme\`, \`default_vehicle_view\`, \`default_grid_mode\`, \`measurement_units\`, \`currency\`, \`notification_preferences\`, \`sidebar_collapsed\`, \`reduced_effects\`, \`created_at\`, \`updated_at\`) VALUES (${sql(prefId)}, ${sql(id)}, 'system', 'exterior', 'grid', 'metric', 'USD', '{}', 0, 0, NOW(3), NOW(3));`,
  );
}

const outDir = new URL('../../../prisma/migrations/20240912130000_seed_aurora_catalog/', import.meta.url);
mkdirSync(outDir, { recursive: true });
writeFileSync(new URL('migration.sql', outDir), `${lines.join('\n')}\n`);
console.log(`Wrote ${lines.length} SQL statements`);
