import { PrismaClient } from '@prisma/client';
import { beforeEach, afterAll, beforeAll } from 'vitest';
import { config } from 'dotenv';
import path from 'path';
import { exec as _exec } from 'child_process';
import { promisify } from 'util';

const exec = promisify(_exec);

// --- Environment Variable Loading ---
// Load environment variables from .env.test.
// This is essential for pointing to your PostgreSQL test database.
// Example .env.test entry: DATABASE_URL="postgresql://user:password@localhost:5432/your_test_db_name"
config({ path: path.resolve(process.cwd(), '.env.test') });

// --- Prisma Client Initialization ---
const prisma = new PrismaClient();

// --- Database Cleaning Function ---
// This function clears all relevant tables to ensure test isolation.
// For PostgreSQL, `deleteMany` is generally safe.
// If you have many records or performance issues, consider raw `TRUNCATE TABLE` commands.
async function clearDatabase() {
  console.log('Clearing database tables...');
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  // Add other tables here that your E2E tests might modify:
  console.log('Database tables cleared.');
}

// --- Vitest Hooks for E2E Tests ---
beforeAll(async () => {
  console.log('\n--- Starting E2E Test Suite Setup ---');
  console.log(`Connecting to PostgreSQL at: ${process.env.DATABASE_URL}`);

  try {
    // 1. Run Prisma migration command for PostgreSQL.
    // 'prisma migrate deploy' applies all pending migrations to the database.
    // It's non-interactive and suitable for automated environments like tests.
    // Make sure your `schema.prisma` points to `DATABASE_URL` for the test environment.
    console.log('Applying Prisma migrations to the PostgreSQL test database...');
    await exec('npx prisma migrate deploy');
    console.log('Prisma migrations applied successfully.');

    // 2. (Optional) Seed the database with baseline test data.
    // If most of your E2E tests require a common set of initial data (e.g., default users, categories),
    // you can create a specific seed script (e.g., `prisma/seed-e2e.ts`) and run it here.
    // This is more efficient than re-seeding in `beforeEach` if data is shared across many tests.
    // For example:
    // console.log('Seeding test database with baseline data...');
    // await exec('npx ts-node prisma/seed-e2e.ts'); // Adjust path and command as needed
    // console.log('Baseline data seeded.');

    // Connect Prisma Client to the database once for the entire test run.
    await prisma.$connect();
    console.log('Prisma client connected to the PostgreSQL test database.');

  } catch (error) {
    console.error('--- E2E Test Setup Failed! ---');
    console.error('Possible causes:');
    console.error('  - PostgreSQL database not running or inaccessible.');
    console.error('  - DATABASE_URL in .env.test is incorrect.');
    console.error('  - Prisma migrations failed (check your schema and migration files).');
    console.error('Error details:', error);
    process.exit(1); // Exit with error if setup fails to prevent broken tests
  }
  console.log('--- E2E Test Suite Setup Complete ---\n');
});

beforeEach(async () => {
  // Clear all data from tables before each test.
  // This is the "rigorous cleaning" part you asked for.
  await clearDatabase();

  // (Optional) Seed specific data for the current test if it's unique to that test.
  // If a test requires specific data that's not part of the `beforeAll` baseline,
  // you'd typically create that data within the test's `it` block.
});

afterAll(async () => {
  console.log('\n--- Starting E2E Test Suite Teardown ---');
  await prisma.$disconnect(); // Disconnect Prisma Client from the database
  console.log('Prisma client disconnected.');
  // No need to delete a database file for PostgreSQL, as it's typically a running service.
  console.log('--- E2E Test Suite Teardown Complete ---\n');
});