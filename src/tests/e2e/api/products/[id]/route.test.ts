// src/app/api/products/[id]/route.e2e.test.ts

import { describe, it, expect } from 'vitest';
import { GET as getProductById, PUT as updateProduct, DELETE as deleteProduct } from '@/app/api/products/[id]/route';
import { createMockRequest, parseNextResponse } from '@/tests/utils/mockNext';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('E2E API /api/products/[id]', () => {
  // Helper for creating mock request context (params)
  const mockContext = (id: string) => ({ params: { id } });

  describe('GET /api/products/[id]', () => {
    it('should return a product by ID with 200 status', async () => {
      // 1. Create necessary category and product in the database for this specific test
      const category = await prisma.category.create({
        data: { name: 'E2E GET By ID Category' }
      });
      const product = await prisma.product.create({
        data: {
          name: 'E2E Product By ID',
          description: 'Description for E2E GET',
          price: 15.00,
          categoryId: category.id,
        },
      });

      const request = createMockRequest({ method: 'GET', url: `/api/products/${product.id}` });
      const response = await getProductById(request, mockContext(product.id));

      const { json, status } = await parseNextResponse(response);

      expect(status).toBe(200);
      expect(json.success).toBe(true);
      // Check for the actual data from the database
      expect(json.data.id).toBe(product.id);
      expect(json.data.name).toBe(product.name);
      expect(json.message).toBe('Product retrieved successfully');
    });

    it('should return 404 if product not found', async () => {
      const nonExistentId = 'non-existent-product-id';
      const request = createMockRequest({ method: 'GET', url: `/api/products/${nonExistentId}` });
      const response = await getProductById(request, mockContext(nonExistentId));

      const { json, status } = await parseNextResponse(response);

      expect(status).toBe(404);
      expect(json.success).toBe(undefined);
      expect(json.error).toContain(`Product with ID ${nonExistentId} was not found`);
    });
  });

  describe('PUT /api/products/[id]', () => {
    it('should update a product and return 200 status', async () => {
      // 1. Create a product that will be updated
      const category = await prisma.category.create({
        data: { name: 'E2E PUT Category' }
      });
      const productToUpdate = await prisma.product.create({
        data: {
          name: 'E2E Product To Update',
          description: 'Description for E2E PUT',
          price: 50.00,
          categoryId: category.id,
        },
      });

      const updateInput = {
        name: 'Updated E2E Product Name',
        price: 150.00,
      };

      const request = createMockRequest({ method: 'PUT', url: `/api/products/${productToUpdate.id}`, body: updateInput });
      const response = await updateProduct(request, mockContext(productToUpdate.id));

      const { json, status } = await parseNextResponse(response);

      expect(status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.name).toBe(updateInput.name);
      expect(json.data.price).toBe(updateInput.price);
      expect(json.message).toBe('Product updated successfully');

      // Verify the update in the database
      const updatedProductInDb = await prisma.product.findUnique({
        where: { id: productToUpdate.id }
      });
      expect(updatedProductInDb?.name).toBe(updateInput.name);
      expect(updatedProductInDb?.price).toBe(updateInput.price);
    });

    it('should return 404 if product to update not found', async () => {
      const nonExistentId = 'non-existent-update-id';
      const updateInput = { name: 'Non Existent' };
      const request = createMockRequest({ method: 'PUT', url: `/api/products/${nonExistentId}`, body: updateInput });
      const response = await updateProduct(request, mockContext(nonExistentId));

      const { json, status } = await parseNextResponse(response);

      expect(status).toBe(404);
      expect(json.success).toBe(undefined);
      expect(json.error).toContain(`Product with ID ${nonExistentId} was not found`);
    });

    it('should return 400 for invalid input (Zod validation)', async () => {
      const invalidUpdateInput = { name: '', price: 'invalid' };
      // Create a dummy product ID to satisfy the route parameter, actual product not used
      const dummyId = 'dummy-product-id';

      const request = createMockRequest({ method: 'PUT', url: `/api/products/${dummyId}`, body: invalidUpdateInput });
      const response = await updateProduct(request, mockContext(dummyId));

      const { json, status } = await parseNextResponse(response);

      expect(status).toBe(400);
      expect(json.success).toBe(undefined);
      expect(json.message).toBe('Validation failed due to invalid input');
      expect(json.errors).toBeDefined();
      expect(json.errors.length).toBeGreaterThan(0);
    });
  });

  describe('DELETE /api/products/[id]', () => {
    it('should delete a product and return 204 status', async () => {
      // 1. Create a product to be deleted
      const category = await prisma.category.create({
        data: { name: 'E2E DELETE Category' }
      });

      const productToDelete = await prisma.product.create({
        data: {
          name: 'E2E Product To Delete',
          description: 'Description for E2E DELETE',
          price: 75.00,
          categoryId: category.id,
        },
      });

      console.log('Product to delete id:', productToDelete.id);

      const request = createMockRequest({ method: 'DELETE', url: `/api/products/${productToDelete.id}` });
      const response = await deleteProduct(request, mockContext(productToDelete.id));

      const { json, status } = await parseNextResponse(response);

      expect(status).toBe(204);
      expect(json).toBeNull(); // 204 No Content should not return a body

      // Verify the product is actually deleted from the database
      const deletedProductInDb = await prisma.product.findUnique({
        where: { id: productToDelete.id }
      });
      expect(deletedProductInDb).toBeNull();
    });

    it('should return 404 if product to delete not found', async () => {
      const nonExistentId = 'non-existent-delete-id';
      const request = createMockRequest({ method: 'DELETE', url: `/api/products/${nonExistentId}` });
      const response = await deleteProduct(request, mockContext(nonExistentId));

      const { json, status } = await parseNextResponse(response);

      expect(status).toBe(404);
      expect(json.success).toBe(undefined);
      expect(json.error).toContain(`Product with ID ${nonExistentId} was not found`);
    });
  });
});