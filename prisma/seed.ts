import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import products from '../data/products.json';
import categories from '../data/categories.json';

const prisma = new PrismaClient();

function mapCondition(condition?: string): 'new' | 'pre_owned' | null {
  if (condition === 'new') return 'new';
  if (condition === 'pre-owned') return 'pre_owned';
  return null;
}

async function main() {
  console.log('Seeding categories...');
  for (const cat of categories as any[]) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: cat,
      create: cat,
    });
  }
  console.log(`Seeded ${categories.length} categories`);

  console.log('Seeding products...');
  for (const product of products as any[]) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: {
        ...product,
        condition: mapCondition(product.condition),
      },
      create: {
        ...product,
        condition: mapCondition(product.condition),
      },
    });
  }
  console.log(`Seeded ${products.length} products`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
