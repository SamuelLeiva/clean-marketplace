// src/tests/e2e/api/categories/route.e2e.test.ts
import { describe, it, expect } from 'vitest'
import {
  GET as getAllCategories,
  POST as createCategory,
} from '@/app/api/categories/route'
import { createMockRequest, parseNextResponse } from '@/tests/utils/mockNext'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Helper for Category-specific data
const validCategoryInput = {
  name: 'E2E New Test Category',
}

describe('E2E API /api/categories', () => {
  describe('GET /api/categories', () => {
    it('should return all categories with 200 status after seeding data', async () => {
      // 1. Create test data directly in the database using prisma
      const category1 = await prisma.category.create({
        data: { name: 'E2E Category A' },
      })
      const category2 = await prisma.category.create({
        data: { name: 'E2E Category B' },
      })

      const request = createMockRequest({
        method: 'GET',
        url: '/api/categories',
      })
      const response = await getAllCategories(request)

      const { json, status } = await parseNextResponse(response)

      expect(status).toBe(200)
      expect(json.success).toBe(true)
      expect(json.data).toHaveLength(2)
      expect(json.data[0].name).toBe(category1.name)
      expect(json.data[1].name).toBe(category2.name)
      expect(json.message).toBe('Categories fetched successfully.')
    })

    it('should return an empty array if no categories exist', async () => {
      // beforeEach hook in setup.e2e.ts ensures the database is clean, so no setup needed here
      const request = createMockRequest({
        method: 'GET',
        url: '/api/categories',
      })
      const response = await getAllCategories(request)

      const { json, status } = await parseNextResponse(response)

      expect(status).toBe(200)
      expect(json.success).toBe(true)
      expect(json.data).toEqual([])
      expect(json.message).toBe('Categories fetched successfully.')
    })
  })

  describe('POST /api/categories', () => {
    it('should create a new category and return 201 status', async () => {
      const request = createMockRequest({
        method: 'POST',
        url: '/api/categories',
        body: validCategoryInput,
      })
      const response = await createCategory(request)

      const { json, status } = await parseNextResponse(response)

      expect(status).toBe(201)
      expect(json.success).toBe(true)
      expect(json.data).toMatchObject({
        name: validCategoryInput.name,
      })
      expect(json.message).toBe('Category created successfully.')

      // Verify category actually exists in the database
      const createdCategoryInDb = await prisma.category.findUnique({
        where: { id: json.data.id },
      })
      expect(createdCategoryInDb).not.toBeNull()
      expect(createdCategoryInDb?.name).toBe(validCategoryInput.name)
    })

    it('should return 400 for invalid input (Zod validation error)', async () => {
      const invalidInput = { name: '' } // Empty name, assuming Zod disallows this

      const request = createMockRequest({
        method: 'POST',
        url: '/api/categories',
        body: invalidInput,
      })
      const response = await createCategory(request)

      const { json, status } = await parseNextResponse(response)

      expect(status).toBe(400)
      expect(json.message).toBe('Validation failed due to invalid input') // Assuming your errorResponse for 400 returns `json.error`
      expect(json.errors).toBeDefined()
      expect(json.errors.length).toBeGreaterThan(0)
    })

    it('should return 409 if category with name already exists', async () => {
      // First, create the category that will cause the conflict
      await prisma.category.create({
        data: { name: validCategoryInput.name },
      })

      const request = createMockRequest({
        method: 'POST',
        url: '/api/categories',
        body: validCategoryInput,
      })
      const response = await createCategory(request)

      const { json, status } = await parseNextResponse(response)

      expect(status).toBe(409)
      expect(json.error).toBe(
        `Category with name ${validCategoryInput.name} already exists`,
      ) // Match CategoryAlreadyExistsError message
    })
  })
})
