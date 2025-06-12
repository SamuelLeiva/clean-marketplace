import { describe, it, expect } from 'vitest'
import {
  CreateProductInput,
  UpdateProductInput,
  ProductResponse,
  ProductListResponse
} from '@/shared/contracts'

describe('Product Schemas', () => {
  const validCategoryId = '123e4567-e89b-12d3-a456-426614174000'
  const validProductId = '123e4567-e89b-12d3-a456-426614174001'

  describe('CreateProductInput', () => {
    it('should validate valid product input', () => {
      const validInput = {
        name: 'iPhone 15',
        description: 'Latest Apple smartphone with advanced features',
        price: 999.99,
        categoryId: validCategoryId
      }

      const result = CreateProductInput.safeParse(validInput)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe('iPhone 15')
        expect(result.data.description).toBe('Latest Apple smartphone with advanced features')
        expect(result.data.price).toBe(999.99)
        expect(result.data.categoryId).toBe(validCategoryId)
      }
    })

    it('should validate with integer price', () => {
      const validInput = {
        name: 'iPhone 15',
        description: 'Latest Apple smartphone with advanced features',
        price: 1000,
        categoryId: validCategoryId
      }

      const result = CreateProductInput.safeParse(validInput)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.price).toBe(1000)
      }
    })

    it('should reject missing name', () => {
      const invalidInput = {
        description: 'Latest Apple smartphone with advanced features',
        price: 999.99,
        categoryId: validCategoryId
      }

      const result = CreateProductInput.safeParse(invalidInput)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].code).toBe('invalid_type')
        expect(result.error.errors[0].path).toEqual(['name'])
      }
    })

    it('should reject name shorter than 3 characters', () => {
      const invalidInput = {
        name: 'iP',
        description: 'Latest Apple smartphone with advanced features',
        price: 999.99,
        categoryId: validCategoryId
      }

      const result = CreateProductInput.safeParse(invalidInput)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Name must be at least 3 characters')
      }
    })

    it('should reject name longer than 100 characters', () => {
      const invalidInput = {
        name: 'i'.repeat(101),
        description: 'Latest Apple smartphone with advanced features',
        price: 999.99,
        categoryId: validCategoryId
      }

      const result = CreateProductInput.safeParse(invalidInput)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Name must be at most 100 characters')
      }
    })

    it('should reject missing description', () => {
      const invalidInput = {
        name: 'iPhone 15',
        price: 999.99,
        categoryId: validCategoryId
      }

      const result = CreateProductInput.safeParse(invalidInput)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].code).toBe('invalid_type')
        expect(result.error.errors[0].path).toEqual(['description'])
      }
    })

    it('should reject description shorter than 10 characters', () => {
      const invalidInput = {
        name: 'iPhone 15',
        description: 'iPhone',
        price: 999.99,
        categoryId: validCategoryId
      }

      const result = CreateProductInput.safeParse(invalidInput)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Description must be at least 10 characters')
      }
    })

    it('should reject description longer than 500 characters', () => {
      const invalidInput = {
        name: 'iPhone 15',
        description: 'A'.repeat(501),
        price: 999.99,
        categoryId: validCategoryId
      }

      const result = CreateProductInput.safeParse(invalidInput)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Name must be at most 500 characters')
      }
    })

    it('should reject missing price', () => {
      const invalidInput = {
        name: 'iPhone 15',
        description: 'Latest Apple smartphone with advanced features',
        categoryId: validCategoryId
      }

      const result = CreateProductInput.safeParse(invalidInput)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Price is required')
      }
    })

    it('should reject non-number price', () => {
      const invalidInput = {
        name: 'iPhone 15',
        description: 'Latest Apple smartphone with advanced features',
        price: '999.99',
        categoryId: validCategoryId
      }

      const result = CreateProductInput.safeParse(invalidInput)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Price must be a number')
      }
    })

    it('should reject zero price', () => {
      const invalidInput = {
        name: 'iPhone 15',
        description: 'Latest Apple smartphone with advanced features',
        price: 0,
        categoryId: validCategoryId
      }

      const result = CreateProductInput.safeParse(invalidInput)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Price must be greater than 0')
      }
    })

    it('should reject negative price', () => {
      const invalidInput = {
        name: 'iPhone 15',
        description: 'Latest Apple smartphone with advanced features',
        price: -10,
        categoryId: validCategoryId
      }

      const result = CreateProductInput.safeParse(invalidInput)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Price must be greater than 0')
      }
    })

    it('should reject missing categoryId', () => {
      const invalidInput = {
        name: 'iPhone 15',
        description: 'Latest Apple smartphone with advanced features',
        price: 999.99
      }

      const result = CreateProductInput.safeParse(invalidInput)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].code).toBe('invalid_type')
        expect(result.error.errors[0].path).toEqual(['categoryId'])
      }
    })

    it('should reject invalid categoryId UUID', () => {
      const invalidInput = {
        name: 'iPhone 15',
        description: 'Latest Apple smartphone with advanced features',
        price: 999.99,
        categoryId: 'invalid-uuid'
      }

      const result = CreateProductInput.safeParse(invalidInput)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Invalid category ID')
      }
    })

    it('should reject extra fields due to strict mode', () => {
      const invalidInput = {
        name: 'iPhone 15',
        description: 'Latest Apple smartphone with advanced features',
        price: 999.99,
        categoryId: validCategoryId,
        extraField: 'not allowed'
      }

      const result = CreateProductInput.safeParse(invalidInput)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].code).toBe('unrecognized_keys')
      }
    })

    it('should reject if createdAt or updatedAt are provided', () => {
      const invalidInput = {
        name: 'iPhone 15',
        description: 'Latest Apple smartphone with advanced features',
        price: 999.99,
        categoryId: validCategoryId,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }

      const result = CreateProductInput.safeParse(invalidInput)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].code).toBe('unrecognized_keys')
      }
    })
  })

  describe('UpdateProductInput', () => {
    it('should validate empty object', () => {
      const validInput = {}

      const result = UpdateProductInput.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it('should validate with only name', () => {
      const validInput = {
        name: 'iPhone 15 Pro'
      }

      const result = UpdateProductInput.safeParse(validInput)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe('iPhone 15 Pro')
      }
    })

    it('should validate with only description', () => {
      const validInput = {
        description: 'Updated description for the latest iPhone'
      }

      const result = UpdateProductInput.safeParse(validInput)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.description).toBe('Updated description for the latest iPhone')
      }
    })

    it('should validate with only price', () => {
      const validInput = {
        price: 1099.99
      }

      const result = UpdateProductInput.safeParse(validInput)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.price).toBe(1099.99)
      }
    })

    it('should validate with only categoryId', () => {
      const validInput = {
        categoryId: validCategoryId
      }

      const result = UpdateProductInput.safeParse(validInput)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.categoryId).toBe(validCategoryId)
      }
    })

    it('should validate with all fields', () => {
      const validInput = {
        name: 'iPhone 15 Pro',
        description: 'Updated description for the latest iPhone',
        price: 1099.99,
        categoryId: validCategoryId
      }

      const result = UpdateProductInput.safeParse(validInput)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe('iPhone 15 Pro')
        expect(result.data.description).toBe('Updated description for the latest iPhone')
        expect(result.data.price).toBe(1099.99)
        expect(result.data.categoryId).toBe(validCategoryId)
      }
    })

    it('should reject invalid name when provided', () => {
      const invalidInput = {
        name: 'iP'
      }

      const result = UpdateProductInput.safeParse(invalidInput)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Name must be at least 3 characters')
      }
    })

    it('should reject invalid description when provided', () => {
      const invalidInput = {
        description: 'Short'
      }

      const result = UpdateProductInput.safeParse(invalidInput)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Description must be at least 10 characters')
      }
    })

    it('should reject invalid price when provided', () => {
      const invalidInput = {
        price: -10
      }

      const result = UpdateProductInput.safeParse(invalidInput)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Price must be greater than 0')
      }
    })

    it('should reject invalid categoryId when provided', () => {
      const invalidInput = {
        categoryId: 'invalid-uuid'
      }

      const result = UpdateProductInput.safeParse(invalidInput)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Invalid category ID')
      }
    })

    it('should reject extra fields due to strict mode', () => {
      const invalidInput = {
        name: 'iPhone 15 Pro',
        extraField: 'not allowed'
      }

      const result = UpdateProductInput.safeParse(invalidInput)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].code).toBe('unrecognized_keys')
      }
    })

    it('should reject if createdAt or updatedAt are provided', () => {
      const invalidInput = {
        name: 'iPhone 15 Pro',
        createdAt: '2024-01-01T00:00:00Z'
      }

      const result = UpdateProductInput.safeParse(invalidInput)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].code).toBe('unrecognized_keys')
      }
    })
  })

  describe('ProductResponse', () => {
    it('should validate valid product response', () => {
      const validResponse = {
        id: validProductId,
        name: 'iPhone 15',
        description: 'Latest Apple smartphone with advanced features',
        price: 999.99,
        categoryId: validCategoryId
      }

      const result = ProductResponse.safeParse(validResponse)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.id).toBe(validProductId)
        expect(result.data.name).toBe('iPhone 15')
        expect(result.data.description).toBe('Latest Apple smartphone with advanced features')
        expect(result.data.price).toBe(999.99)
        expect(result.data.categoryId).toBe(validCategoryId)
      }
    })

    it('should reject missing id', () => {
      const invalidResponse = {
        name: 'iPhone 15',
        description: 'Latest Apple smartphone with advanced features',
        price: 999.99,
        categoryId: validCategoryId
      }

      const result = ProductResponse.safeParse(invalidResponse)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].code).toBe('invalid_type')
        expect(result.error.errors[0].path).toEqual(['id'])
      }
    })

    it('should reject invalid id UUID', () => {
      const invalidResponse = {
        id: 'invalid-uuid',
        name: 'iPhone 15',
        description: 'Latest Apple smartphone with advanced features',
        price: 999.99,
        categoryId: validCategoryId
      }

      const result = ProductResponse.safeParse(invalidResponse)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].code).toBe('invalid_string')
      }
    })

    it('should reject missing required fields', () => {
      const invalidResponse = {
        id: validProductId
      }

      const result = ProductResponse.safeParse(invalidResponse)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors.length).toBeGreaterThan(0)
        expect(result.error.errors.some(err => err.path.includes('name'))).toBe(true)
      }
    })

    it('should reject invalid field values', () => {
      const invalidResponse = {
        id: validProductId,
        name: 'iP', // too short
        description: 'Latest Apple smartphone with advanced features',
        price: 999.99,
        categoryId: validCategoryId
      }

      const result = ProductResponse.safeParse(invalidResponse)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Name must be at least 3 characters')
      }
    })

    it('should not include createdAt and updatedAt in response', () => {
      const responseWithTimestamps = {
        id: validProductId,
        name: 'iPhone 15',
        description: 'Latest Apple smartphone with advanced features',
        price: 999.99,
        categoryId: validCategoryId,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }

      const result = ProductResponse.safeParse(responseWithTimestamps)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].code).toBe('unrecognized_keys')
      }
    })

    it('should reject extra fields due to strict mode', () => {
      const invalidResponse = {
        id: validProductId,
        name: 'iPhone 15',
        description: 'Latest Apple smartphone with advanced features',
        price: 999.99,
        categoryId: validCategoryId,
        extraField: 'not allowed'
      }

      const result = ProductResponse.safeParse(invalidResponse)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].code).toBe('unrecognized_keys')
      }
    })
  })

  describe('ProductListResponse', () => {
    it('should validate empty array', () => {
      const validList: unknown = []

      const result = ProductListResponse.safeParse(validList)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual([])
      }
    })

    it('should validate array with valid products', () => {
      const validList = [
        {
          id: validProductId,
          name: 'iPhone 15',
          description: 'Latest Apple smartphone with advanced features',
          price: 999.99,
          categoryId: validCategoryId
        },
        {
          id: '123e4567-e89b-12d3-a456-426614174002',
          name: 'MacBook Pro',
          description: 'Professional laptop for creative professionals',
          price: 2499.99,
          categoryId: validCategoryId
        }
      ]

      const result = ProductListResponse.safeParse(validList)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toHaveLength(2)
        expect(result.data[0].name).toBe('iPhone 15')
        expect(result.data[1].name).toBe('MacBook Pro')
      }
    })

    it('should reject array with invalid product', () => {
      const invalidList = [
        {
          id: validProductId,
          name: 'iPhone 15',
          description: 'Latest Apple smartphone with advanced features',
          price: 999.99,
          categoryId: validCategoryId
        },
        {
          id: 'invalid-uuid',
          name: 'MacBook Pro',
          description: 'Professional laptop for creative professionals',
          price: 2499.99,
          categoryId: validCategoryId
        }
      ]

      const result = ProductListResponse.safeParse(invalidList)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].code).toBe('invalid_string')
      }
    })

    it('should reject non-array input', () => {
      const invalidList = {
        id: validProductId,
        name: 'iPhone 15',
        description: 'Latest Apple smartphone with advanced features',
        price: 999.99,
        categoryId: validCategoryId
      }

      const result = ProductListResponse.safeParse(invalidList)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].code).toBe('invalid_type')
      }
    })
  })

  describe('Edge Cases', () => {
    it('should handle null values', () => {
      const nullInput = null

      const createResult = CreateProductInput.safeParse(nullInput)
      const updateResult = UpdateProductInput.safeParse(nullInput)
      const responseResult = ProductResponse.safeParse(nullInput)
      const listResult = ProductListResponse.safeParse(nullInput)

      expect(createResult.success).toBe(false)
      expect(updateResult.success).toBe(false)
      expect(responseResult.success).toBe(false)
      expect(listResult.success).toBe(false)
    })

    it('should handle undefined values', () => {
      const undefinedInput = undefined

      const createResult = CreateProductInput.safeParse(undefinedInput)
      const updateResult = UpdateProductInput.safeParse(undefinedInput)
      const responseResult = ProductResponse.safeParse(undefinedInput)
      const listResult = ProductListResponse.safeParse(undefinedInput)

      expect(createResult.success).toBe(false)
      expect(updateResult.success).toBe(false)
      expect(responseResult.success).toBe(false)
      expect(listResult.success).toBe(false)
    })

    it('should handle string inputs instead of objects', () => {
      const stringInput = 'invalid'

      const createResult = CreateProductInput.safeParse(stringInput)
      const updateResult = UpdateProductInput.safeParse(stringInput)
      const responseResult = ProductResponse.safeParse(stringInput)

      expect(createResult.success).toBe(false)
      expect(updateResult.success).toBe(false)
      expect(responseResult.success).toBe(false)
    })

    it('should validate exact boundary values', () => {
      const boundaryInput = {
        name: 'iPh', // exactly 3 characters
        description: 'A'.repeat(10), // exactly 10 characters
        price: 0.01, // smallest positive number
        categoryId: validCategoryId
      }

      const createResult = CreateProductInput.safeParse(boundaryInput)
      expect(createResult.success).toBe(true)

      const maxBoundaryInput = {
        name: 'i'.repeat(100), // exactly 100 characters
        description: 'A'.repeat(500), // exactly 500 characters
        price: Number.MAX_SAFE_INTEGER,
        categoryId: validCategoryId
      }

      const maxCreateResult = CreateProductInput.safeParse(maxBoundaryInput)
      expect(maxCreateResult.success).toBe(true)
    })

    it('should handle very large prices', () => {
      const largePrice = {
        name: 'Expensive Item',
        description: 'Very expensive luxury item with premium features',
        price: 999999999.99,
        categoryId: validCategoryId
      }

      const result = CreateProductInput.safeParse(largePrice)
      expect(result.success).toBe(true)
    })

    it('should handle decimal prices with many decimal places', () => {
      const precisePrice = {
        name: 'Precise Item',
        description: 'Item with very precise pricing calculation',
        price: 99.999999,
        categoryId: validCategoryId
      }

      const result = CreateProductInput.safeParse(precisePrice)
      expect(result.success).toBe(true)
    })

    it('should handle NaN and Infinity prices', () => {
      const nanPrice = {
        name: 'Invalid Item',
        description: 'Item with invalid price calculation',
        price: NaN,
        categoryId: validCategoryId
      }

      const infinityPrice = {
        name: 'Invalid Item',
        description: 'Item with invalid price calculation',
        price: Infinity,
        categoryId: validCategoryId
      }

      const nanResult = CreateProductInput.safeParse(nanPrice)
      const infinityResult = CreateProductInput.safeParse(infinityPrice)

      expect(nanResult.success).toBe(false)
      expect(infinityResult.success).toBe(false)
    })
  })
})