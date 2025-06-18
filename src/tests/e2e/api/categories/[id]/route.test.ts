// src/tests/e2e/api/categories/[id]/route.e2e.test.ts
import { describe, it, expect } from 'vitest'
import {
  GET as getCategoryById,
  PUT as updateCategory,
  DELETE as deleteCategory,
} from '@/app/api/categories/[id]/route'
import { createMockRequest, parseNextResponse } from '@/tests/utils/mockNext'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Helper for mock request context (params)
const mockContext = (id: string) => ({ params: { id } })

const updatedCategoryInput = {
  name: 'E2E Updated Category Name',
}

describe('E2E API /api/categories/[id]', () => {
  describe('GET /api/categories/[id]', () => {
    it('should return a category by ID with 200 status', async () => {
      // Create category in the database
      const category = await prisma.category.create({
        data: { name: 'E2E Category By ID' },
      })

      const request = createMockRequest({
        method: 'GET',
        url: `/api/categories/${category.id}`,
      })
      const response = await getCategoryById(request, mockContext(category.id))

      const { json, status } = await parseNextResponse(response)

      expect(status).toBe(200)
      expect(json.success).toBe(true)
      expect(json.data.id).toBe(category.id)
      expect(json.data.name).toBe(category.name)
      expect(json.message).toBe('Category fetched successfully.')
    })

    it('should return 404 if category not found', async () => {
      const nonExistentId = 'non-existent-category-id'
      const request = createMockRequest({
        method: 'GET',
        url: `/api/categories/${nonExistentId}`,
      })
      const response = await getCategoryById(
        request,
        mockContext(nonExistentId),
      )

      const { json, status } = await parseNextResponse(response)

      expect(status).toBe(404)
      expect(json.error).toBe(`Category with ID ${nonExistentId} was not found`) // Match CategoryNotFoundError message
    })
  })

  describe('PUT /api/categories/[id]', () => {
    it('should update a category and return 200 status', async () => {
      // Create a category that will be updated
      const categoryToUpdate = await prisma.category.create({
        data: { name: 'E2E Category To Update' },
      })

      const request = createMockRequest({
        method: 'PUT',
        url: `/api/categories/${categoryToUpdate.id}`,
        body: updatedCategoryInput,
      })
      const response = await updateCategory(
        request,
        mockContext(categoryToUpdate.id),
      )

      const { json, status } = await parseNextResponse(response)

      expect(status).toBe(200)
      expect(json.success).toBe(true)
      expect(json.data.name).toBe(updatedCategoryInput.name)
      expect(json.message).toBe('Category updated successfully.')

      // Verify the update in the database
      const updatedCategoryInDb = await prisma.category.findUnique({
        where: { id: categoryToUpdate.id },
      })
      expect(updatedCategoryInDb?.name).toBe(updatedCategoryInput.name)
    })

    it('should return 404 if category to update not found', async () => {
      const nonExistentId = 'non-existent-update-id'
      const request = createMockRequest({
        method: 'PUT',
        url: `/api/categories/${nonExistentId}`,
        body: updatedCategoryInput,
      })
      const response = await updateCategory(request, mockContext(nonExistentId))

      const { json, status } = await parseNextResponse(response)

      expect(status).toBe(404)
      expect(json.error).toBe(`Category with ID ${nonExistentId} was not found`) // Match CategoryNotFoundError message
    })

    it('should return 400 for invalid input (Zod validation)', async () => {
      const invalidUpdateInput = { name: '' } // Invalid: empty name

      const dummyId = 'dummy-category-id' // Dummy ID for route param
      const request = createMockRequest({
        method: 'PUT',
        url: `/api/categories/${dummyId}`,
        body: invalidUpdateInput,
      })
      const response = await updateCategory(request, mockContext(dummyId))

      const { json, status } = await parseNextResponse(response)

      expect(status).toBe(400)
      expect(json.message).toBe('Validation failed due to invalid input')
      expect(json.errors).toBeDefined()
      expect(json.errors.length).toBeGreaterThan(0)
    })

    it('should return 409 if updated category name already exists', async () => {
      // Create two categories: one to update, and one with the conflicting name
      const existingCategory = await prisma.category.create({
        data: { name: 'Existing Category' },
      })
      const categoryToUpdate = await prisma.category.create({
        data: { name: 'Category That Will Conflict' },
      })

      const conflictingUpdateInput = { name: existingCategory.name }

      const request = createMockRequest({
        method: 'PUT',
        url: `/api/categories/${categoryToUpdate.id}`,
        body: conflictingUpdateInput,
      })
      const response = await updateCategory(
        request,
        mockContext(categoryToUpdate.id),
      )

      const { json, status } = await parseNextResponse(response)

      expect(status).toBe(409)
      expect(json.error).toBe(
        `Category with name ${existingCategory.name} already exists`,
      ) // Match CategoryAlreadyExistsError message
    })
  })

  describe('DELETE /api/categories/[id]', () => {
    it('should delete a category and return 204 status', async () => {
      // Create a category to be deleted
      const categoryToDelete = await prisma.category.create({
        data: { name: 'E2E Category To Delete' },
      })

      const request = createMockRequest({
        method: 'DELETE',
        url: `/api/categories/${categoryToDelete.id}`,
      })
      const response = await deleteCategory(
        request,
        mockContext(categoryToDelete.id),
      )

      const { json, status } = await parseNextResponse(response)

      expect(status).toBe(204)
      expect(json).toBeNull() // For 204 No Content

      // Verify the category is actually deleted from the database
      const deletedCategoryInDb = await prisma.category.findUnique({
        where: { id: categoryToDelete.id },
      })
      expect(deletedCategoryInDb).toBeNull()
    })

    it('should return 404 if category to delete not found', async () => {
      const nonExistentId = 'non-existent-delete-id'
      const request = createMockRequest({
        method: 'DELETE',
        url: `/api/categories/${nonExistentId}`,
      })
      const response = await deleteCategory(request, mockContext(nonExistentId))

      const { json, status } = await parseNextResponse(response)

      expect(status).toBe(404)
      expect(json.error).toBe(`Category with ID ${nonExistentId} was not found`) // Match CategoryNotFoundError message
    })

    it('should return 409 if category cannot be deleted due to dependencies', async () => {
      // Create a category and a product linked to it
      const categoryWithProducts = await prisma.category.create({
        data: { name: 'Category With Products' },
      })
      await prisma.product.create({
        data: {
          name: 'Product in Category',
          price: 10,
          description: 'This product is linked to the category',
          categoryId: categoryWithProducts.id,
        },
      })

      const request = createMockRequest({
        method: 'DELETE',
        url: `/api/categories/${categoryWithProducts.id}`,
      })
      const response = await deleteCategory(
        request,
        mockContext(categoryWithProducts.id),
      )

      const { json, status } = await parseNextResponse(response)

      // Depending on your `CannotDeleteCategoryError` and `handleError` mapping:
      // If `CannotDeleteCategoryError` maps to 400:
      expect(status).toBe(409)
      expect(json.error).toBe(
        `Category with ID ${categoryWithProducts.id} cannot be deleted as it has existing dependencies`,
      )
    })
  })
})
