import { describe, it, expect } from 'vitest'
import {
  CreateCategoryInput,
  UpdateCategoryInput,
  CategoryResponse,
  CategoryListResponse
} from '@/shared/contracts'

describe('Category Schemas', () => {
  describe('CreateCategoryInput', () => {
    it('should validate valid input with name only', () => {
      const validInput = {
        name: 'Technology'
      }

      const result = CreateCategoryInput.safeParse(validInput)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe('Technology')
        expect(result.data.description).toBeUndefined()
      }
    })

    it('should validate valid input with name and description', () => {
      const validInput = {
        name: 'Technology',
        description: 'All about technology and innovation'
      }

      const result = CreateCategoryInput.safeParse(validInput)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe('Technology')
        expect(result.data.description).toBe('All about technology and innovation')
      }
    })

    it('should reject name shorter than 3 characters', () => {
      const invalidInput = {
        name: 'Te'
      }

      const result = CreateCategoryInput.safeParse(invalidInput)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Name must be at least 3 characters')
      }
    })

    it('should reject name longer than 100 characters', () => {
      const invalidInput = {
        name: 'T'.repeat(101)
      }

      const result = CreateCategoryInput.safeParse(invalidInput)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Name must be at most 100 characters')
      }
    })

    it('should reject description shorter than 10 characters', () => {
      const invalidInput = {
        name: 'Technology',
        description: 'Short'
      }

      const result = CreateCategoryInput.safeParse(invalidInput)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Description must be at least 10 characters')
      }
    })

    it('should reject description longer than 500 characters', () => {
      const invalidInput = {
        name: 'Technology',
        description: 'T'.repeat(501)
      }

      const result = CreateCategoryInput.safeParse(invalidInput)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Name must be at most 500 characters')
      }
    })

    it('should reject missing name field', () => {
      const invalidInput = {
        description: 'Valid description here'
      }

      const result = CreateCategoryInput.safeParse(invalidInput)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].code).toBe('invalid_type')
      }
    })

    it('should reject non-string name', () => {
      const invalidInput = {
        name: 123
      }

      const result = CreateCategoryInput.safeParse(invalidInput)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].code).toBe('invalid_type')
      }
    })

    it('should reject non-string description', () => {
      const invalidInput = {
        name: 'Technology',
        description: 123
      }

      const result = CreateCategoryInput.safeParse(invalidInput)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].code).toBe('invalid_type')
      }
    })

    it('should reject if createdAt or updatedAt are provided', () => {
      const invalidInput = {
        name: 'Technology',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }

      const result = CreateCategoryInput.safeParse(invalidInput)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors.some(err => err.code === 'unrecognized_keys')).toBe(true)
      }
    })
  })

  describe('UpdateCategoryInput', () => {
    it('should validate empty object', () => {
      const validInput = {}

      const result = UpdateCategoryInput.safeParse(validInput)
      expect(result.success).toBe(true)
    })

    it('should validate with only name', () => {
      const validInput = {
        name: 'Updated Technology'
      }

      const result = UpdateCategoryInput.safeParse(validInput)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe('Updated Technology')
      }
    })

    it('should validate with only description', () => {
      const validInput = {
        description: 'Updated description about technology'
      }

      const result = UpdateCategoryInput.safeParse(validInput)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.description).toBe('Updated description about technology')
      }
    })

    it('should validate with both name and description', () => {
      const validInput = {
        name: 'Updated Technology',
        description: 'Updated description about technology'
      }

      const result = UpdateCategoryInput.safeParse(validInput)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe('Updated Technology')
        expect(result.data.description).toBe('Updated description about technology')
      }
    })

    it('should reject invalid name when provided', () => {
      const invalidInput = {
        name: 'Te'
      }

      const result = UpdateCategoryInput.safeParse(invalidInput)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Name must be at least 3 characters')
      }
    })

    it('should reject invalid description when provided', () => {
      const invalidInput = {
        description: 'Short'
      }

      const result = UpdateCategoryInput.safeParse(invalidInput)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Description must be at least 10 characters')
      }
    })

    it('should reject if createdAt or updatedAt are provided', () => {
      const invalidInput = {
        name: 'Technology',
        createdAt: '2024-01-01T00:00:00Z'
      }

      const result = UpdateCategoryInput.safeParse(invalidInput)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors.some(err => err.code === 'unrecognized_keys')).toBe(true)
      }
    })
  })

  describe('CategoryResponse', () => {
    it('should validate valid category response', () => {
      const validResponse = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Technology',
        description: 'All about technology and innovation'
      }

      const result = CategoryResponse.safeParse(validResponse)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.id).toBe('123e4567-e89b-12d3-a456-426614174000')
        expect(result.data.name).toBe('Technology')
        expect(result.data.description).toBe('All about technology and innovation')
      }
    })

    it('should validate category response without description', () => {
      const validResponse = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Technology'
      }

      const result = CategoryResponse.safeParse(validResponse)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.id).toBe('123e4567-e89b-12d3-a456-426614174000')
        expect(result.data.name).toBe('Technology')
        expect(result.data.description).toBeUndefined()
      }
    })

    it('should reject invalid UUID', () => {
      const invalidResponse = {
        id: 'invalid-uuid',
        name: 'Technology'
      }

      const result = CategoryResponse.safeParse(invalidResponse)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].code).toBe('invalid_string')
      }
    })

    it('should reject missing id', () => {
      const invalidResponse = {
        name: 'Technology'
      }

      const result = CategoryResponse.safeParse(invalidResponse)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].code).toBe('invalid_type')
      }
    })

    it('should reject missing name', () => {
      const invalidResponse = {
        id: '123e4567-e89b-12d3-a456-426614174000'
      }

      const result = CategoryResponse.safeParse(invalidResponse)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].code).toBe('invalid_type')
      }
    })

    it('should reject invalid name length', () => {
      const invalidResponse = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Te'
      }

      const result = CategoryResponse.safeParse(invalidResponse)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Name must be at least 3 characters')
      }
    })

    it('should reject invalid description length', () => {
      const invalidResponse = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Technology',
        description: 'Short'
      }

      const result = CategoryResponse.safeParse(invalidResponse)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('Description must be at least 10 characters')
      }
    })

    it('should not include createdAt and updatedAt in response', () => {
      const responseWithTimestamps = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Technology',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }

      const result = CategoryResponse.safeParse(responseWithTimestamps)
      console.log("Result: ", result)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors.some(err => err.code === 'unrecognized_keys')).toBe(true)
      }
    })
  })

  describe('CategoryListResponse', () => {
    it('should validate empty array', () => {
      const validList: unknown = []

      const result = CategoryListResponse.safeParse(validList)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual([])
      }
    })

    it('should validate array with valid categories', () => {
      const validList = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Technology',
          description: 'All about technology and innovation'
        },
        {
          id: '123e4567-e89b-12d3-a456-426614174001',
          name: 'Science'
        }
      ]

      const result = CategoryListResponse.safeParse(validList)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toHaveLength(2)
        expect(result.data[0].name).toBe('Technology')
        expect(result.data[1].name).toBe('Science')
      }
    })

    it('should reject array with invalid category', () => {
      const invalidList = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Technology'
        },
        {
          id: 'invalid-uuid',
          name: 'Science'
        }
      ]

      const result = CategoryListResponse.safeParse(invalidList)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].code).toBe('invalid_string')
      }
    })

    it('should reject non-array input', () => {
      const invalidList = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Technology'
      }

      const result = CategoryListResponse.safeParse(invalidList)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].code).toBe('invalid_type')
      }
    })
  })

  describe('Edge Cases', () => {
    it('should handle null values', () => {
      const nullInput = null

      const createResult = CreateCategoryInput.safeParse(nullInput)
      const updateResult = UpdateCategoryInput.safeParse(nullInput)
      const responseResult = CategoryResponse.safeParse(nullInput)
      const listResult = CategoryListResponse.safeParse(nullInput)

      expect(createResult.success).toBe(false)
      expect(updateResult.success).toBe(false)
      expect(responseResult.success).toBe(false)
      expect(listResult.success).toBe(false)
    })

    it('should handle undefined values', () => {
      const undefinedInput = undefined

      const createResult = CreateCategoryInput.safeParse(undefinedInput)
      const updateResult = UpdateCategoryInput.safeParse(undefinedInput)
      const responseResult = CategoryResponse.safeParse(undefinedInput)
      const listResult = CategoryListResponse.safeParse(undefinedInput)

      expect(createResult.success).toBe(false)
      expect(updateResult.success).toBe(false)
      expect(responseResult.success).toBe(false)
      expect(listResult.success).toBe(false)
    })

    it('should handle string inputs instead of objects', () => {
      const stringInput = 'invalid'

      const createResult = CreateCategoryInput.safeParse(stringInput)
      const updateResult = UpdateCategoryInput.safeParse(stringInput)
      const responseResult = CategoryResponse.safeParse(stringInput)

      expect(createResult.success).toBe(false)
      expect(updateResult.success).toBe(false)
      expect(responseResult.success).toBe(false)
    })

    it('should validate exact boundary values', () => {
      const boundaryInput = {
        name: 'Tec', // exactly 3 characters
        description: 'A'.repeat(10) // exactly 10 characters
      }

      const createResult = CreateCategoryInput.safeParse(boundaryInput)
      expect(createResult.success).toBe(true)

      const maxBoundaryInput = {
        name: 'T'.repeat(100), // exactly 100 characters
        description: 'A'.repeat(500) // exactly 500 characters
      }

      const maxCreateResult = CreateCategoryInput.safeParse(maxBoundaryInput)
      expect(maxCreateResult.success).toBe(true)
    })
  })
})