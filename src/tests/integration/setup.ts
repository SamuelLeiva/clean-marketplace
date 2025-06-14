import { PrismaClient } from '@prisma/client';
import { beforeEach, afterAll } from 'vitest';

const prisma = new PrismaClient();

// Function to clear all tables. Adapt if you have more tables.
async function clearDatabase() {
  // You can delete records in a specific order if there are foreign key constraints
  // For now, assuming product is independent or can be deleted directly.
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  // Add other tables if needed:
}

beforeEach(async () => {
  // Clean up the database before each test to ensure isolation
  await clearDatabase();
});

afterAll(async () => {
  // Disconnect Prisma client after all tests are done
  await prisma.$disconnect();
  console.log('Prisma client disconnected');
});