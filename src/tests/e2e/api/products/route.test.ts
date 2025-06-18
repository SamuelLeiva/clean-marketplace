// src/app/api/products/route.e2e.test.ts

import { describe, it, expect } from 'vitest';
import { GET as getAllProducts, POST as createProduct } from '@/app/api/products/route';
import { createMockRequest, parseNextResponse } from '@/tests/utils/mockNext';
import { PrismaClient } from '@prisma/client';

// IMPORTANT: REMOVE ALL vi.mock CALLS FOR PrismaProductRepository
// This test will now hit the real database via your API route's use of PrismaProductRepository.
// The database cleanup is handled by src/tests/setup.e2e.ts's beforeEach hook.
const prisma = new PrismaClient();

describe('E2E API /api/products', () => {

  describe('GET /api/products', () => {
    it('should return all products with 200 status after seeding data', async () => {
      // 1. Create test data directly in the database using prisma
      //    (prisma is made available by src/tests/setup.e2e.ts)
      const category = await prisma.category.create({
        data: { name: 'E2E Test Category' }
      });
      const product1 = await prisma.product.create({
        data: { name: 'E2E Product 1', description: "Producto 1", price: 10.99, categoryId: category.id }
      });
      const product2 = await prisma.product.create({
        data: { name: 'E2E Product 2', description: "Producto 2", price: 20.50, categoryId: category.id }
      });

      const request = createMockRequest({ method: 'GET', url: '/api/products' });
      const response = await getAllProducts(request);

      const { json, status } = await parseNextResponse(response);

      expect(status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data).toHaveLength(2);
      expect(json.data[0].name).toBe(product1.name); // Check actual data
      expect(json.data[1].name).toBe(product2.name);
      expect(json.message).toBe('Products retrieved successfully');
    });

    it('should return an empty array if no products exist', async () => {
      // beforeEach hook in setup.e2e.ts ensures the database is clean, so no setup needed here
      const request = createMockRequest({ method: 'GET', url: '/api/products' });
      const response = await getAllProducts(request);

      const { json, status } = await parseNextResponse(response);

      expect(status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data).toEqual([]);
      expect(json.message).toBe('Products retrieved successfully');
    });
  });

  describe('POST /api/products', () => {
    const validProductInput = {
      name: 'E2E New Test Product',
      description: 'Description of the new product for E2E.',
      price: 100.00,
      categoryId: '33b926de-816a-4b24-b707-16cf8c95aa26', // Unique ID for this test's category
    };

    it('should create a new product and return 201 status', async () => {
      // Create required category for the product
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const category = await prisma.category.create({
        data: { id: validProductInput.categoryId, name: 'E2E Product Category for POST' }
      });

      const request = createMockRequest({ method: 'POST', url: '/api/products', body: validProductInput });
      const response = await createProduct(request);

      const { json, status } = await parseNextResponse(response);

      expect(status).toBe(201);
      expect(json.success).toBe(true);
      expect(json.data).toMatchObject({
        name: validProductInput.name,
        price: validProductInput.price,
        categoryId: validProductInput.categoryId,
      });
      expect(json.message).toBe('Product created successfully');

      // Verify product actually exists in the database
      const createdProductInDb = await prisma.product.findUnique({
        where: { id: json.data.id }
      });
      expect(createdProductInDb).not.toBeNull();
      expect(createdProductInDb?.name).toBe(validProductInput.name);
    });

    it('should return 400 for invalid input (Zod validation error)', async () => {
      const invalidInput = { name: 'TooShort', price: -5 };

      const request = createMockRequest({ method: 'POST', url: '/api/products', body: invalidInput });
      const response = await createProduct(request);

      const { json, status } = await parseNextResponse(response);

      expect(status).toBe(400);
      expect(json.success).toBe(undefined);
      expect(json.message).toBe('Validation failed due to invalid input');
      expect(json.errors).toBeDefined();
      expect(json.errors.length).toBeGreaterThan(0);
    });

    it('should return 409 if product with name already exists', async () => {
      // First, create the product that will cause the conflict
      const category = await prisma.category.create({
        data: { name: 'E2E Conflict Category' }
      });
      await prisma.product.create({
        data: { name: validProductInput.name, description: "Descripción", price: 50, categoryId: category.id }
      });

      const request = createMockRequest({ method: 'POST', url: '/api/products', body: validProductInput });
      const response = await createProduct(request);

      const { json, status } = await parseNextResponse(response);

      expect(status).toBe(409);
      expect(json.success).toBe(undefined);
      expect(json.error).toBe(`Product with name ${validProductInput.name} already exists`);
    });
  });
});