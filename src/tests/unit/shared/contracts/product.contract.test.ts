import {
  CreateProductInput,
  ProductListResponse,
  ProductResponse,
  UpdateProductInput,
} from '@/shared/contracts/product.contract'
import { describe, it, expect } from 'vitest'

const validUuid = '123e4567-e89b-12d3-a456-426614174000'
const invalidUuid = 'invalid-uuid'

describe('Product Schemas', () => {
  const validProductData = {
    name: 'Test Product',
    description: 'This is a valid product description',
    price: 29.99,
    categoryId: validUuid,
  }

  describe('CreateProductInput', () => {
    it('should validate a valid product input', () => {
      const result = CreateProductInput.safeParse(validProductData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(validProductData)
      }
    })
  })

  describe('name validation', () => {
    it('should reject names shorter than 3 characters', () => {
      const result = CreateProductInput.safeParse({
        ...validProductData,
        name: 'AB',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Name must be at least 3 characters',
        )
      }
    })

    it('should reject names longer than 100 characters', () => {
      const result = CreateProductInput.safeParse({
        ...validProductData,
        name: 'A'.repeat(101),
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Name must be at most 100 characters',
        )
      }
    })

    it('should accept names at boundary values', () => {
      // 3 characters (minimum)
      const min = CreateProductInput.safeParse({
        ...validProductData,
        name: 'ABC',
      })
      expect(min.success).toBe(true)

      // 100 characters (maximum)
      const max = CreateProductInput.safeParse({
        ...validProductData,
        name: 'A'.repeat(100),
      })
      expect(max.success).toBe(true)
    })

    it('should reject non-string names', () => {
      const result = CreateProductInput.safeParse({
        ...validProductData,
        name: 123,
      })
      expect(result.success).toBe(false)
    })
  })

  describe('description validation', () => {
    it('should reject descriptions shorter than 10 characters', () => {
      const result = CreateProductInput.safeParse({
        ...validProductData,
        description: 'Short',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Description must be at least 10 characters',
        )
      }
    })

    it('should reject descriptions longer than 500 characters', () => {
      const result = CreateProductInput.safeParse({
        ...validProductData,
        description: 'A'.repeat(501),
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Name must be at most 500 characters',
        )
      }
    })

    it('should accept descriptions at boundary values', () => {
      // 10 characters (minimum)
      const min = CreateProductInput.safeParse({
        ...validProductData,
        description: 'A'.repeat(10),
      })
      expect(min.success).toBe(true)

      // 500 characters (maximum)
      const max = CreateProductInput.safeParse({
        ...validProductData,
        description: 'A'.repeat(500),
      })
      expect(max.success).toBe(true)
    })
  })

  describe('price validation', () => {
    it('should reject negative prices', () => {
      const result = CreateProductInput.safeParse({
        ...validProductData,
        price: -10,
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Price must be greater than 0',
        )
      }
    })

    it('should reject zero price', () => {
      const result = CreateProductInput.safeParse({
        ...validProductData,
        price: 0,
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Price must be greater than 0',
        )
      }
    })

    it('should accept positive decimal prices', () => {
      const result = CreateProductInput.safeParse({
        ...validProductData,
        price: 99.99,
      })
      expect(result.success).toBe(true)
    })

    it('should reject non-numeric prices', () => {
      const result = CreateProductInput.safeParse({
        ...validProductData,
        price: 'not-a-number',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Price must be a number')
      }
    })

    it('should reject missing price', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { price, ...dataWithoutPrice } = validProductData
      const result = CreateProductInput.safeParse(dataWithoutPrice)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Price is required')
      }
    })
  })

  describe('categoryId validation', () => {
    it('should reject invalid UUID format', () => {
      const result = CreateProductInput.safeParse({
        ...validProductData,
        categoryId: invalidUuid,
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid category ID')
      }
    })

    it('should accept valid UUID', () => {
      const result = CreateProductInput.safeParse(validProductData)
      expect(result.success).toBe(true)
    })
  })

  it('should reject missing required fields', () => {
    const result = CreateProductInput.safeParse({})
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues).toHaveLength(4) // 4 required fields
    }
  })
})

describe('UpdateProductInput', () => {
  it('should accept partial data (all fields optional)', () => {
    const result = UpdateProductInput.safeParse({
      name: 'Updated Name',
    })
    expect(result.success).toBe(true)
  })

  it('should accept empty object', () => {
    const result = UpdateProductInput.safeParse({})
    expect(result.success).toBe(true)
  })

  it('should still validate provided fields', () => {
    const result = UpdateProductInput.safeParse({
      name: 'AB', // Too short
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Name must be at least 3 characters',
      )
    }
  })

  it('should validate multiple optional fields', () => {
    const result = UpdateProductInput.safeParse({
      name: 'Valid Name',
      price: 15.99,
      categoryId: validUuid,
    })
    expect(result.success).toBe(true)
  })
})

describe('ProductResponse', () => {
  const validResponseData = {
    id: validUuid,
    name: 'Test Product',
    description: 'This is a valid product description',
    price: 29.99,
    categoryId: validUuid,
  }

  it('should validate a complete product response', () => {
    const result = ProductResponse.safeParse(validResponseData)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(validResponseData)
    }
  })

  it('should require id field', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...dataWithoutId } = validResponseData
    const result = ProductResponse.safeParse(dataWithoutId)
    expect(result.success).toBe(false)
  })

  it('should validate id as UUID', () => {
    const result = ProductResponse.safeParse({
      ...validResponseData,
      id: invalidUuid,
    })
    expect(result.success).toBe(false)
  })

  it('should inherit all base validations', () => {
    const result = ProductResponse.safeParse({
      ...validResponseData,
      name: 'AB', // Too short
    })
    expect(result.success).toBe(false)
  })
})

describe('ProductListResponse', () => {
  const validProduct1 = {
    id: validUuid,
    name: 'Product 1',
    description: 'Description for product 1',
    price: 19.99,
    categoryId: validUuid,
  }

  const validProduct2 = {
    id: '987fcdeb-51d2-43ab-c123-456789abcdef',
    name: 'Product 2',
    description: 'Description for product 2',
    price: 39.99,
    categoryId: validUuid,
  }

  it('should validate empty array', () => {
    const result = ProductListResponse.safeParse([])
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual([])
    }
  })

  it('should validate array with single product', () => {
    const result = ProductListResponse.safeParse([validProduct1])
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toHaveLength(1)
    }
  })

  it('should validate array with multiple products', () => {
    const result = ProductListResponse.safeParse([validProduct1, validProduct2])
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toHaveLength(2)
    }
  })

  it('should reject array with invalid product', () => {
    const invalidProduct = {
      ...validProduct1,
      price: -10, // Invalid price
    }
    const result = ProductListResponse.safeParse([
      validProduct1,
      invalidProduct,
    ])
    expect(result.success).toBe(false)
  })

  it('should reject non-array input', () => {
    const result = ProductListResponse.safeParse(validProduct1)
    expect(result.success).toBe(false)
  })
})

describe('Type inference', () => {
  it('should infer correct types', () => {
    // Estas son pruebas de tipo que se verifican en tiempo de compilación
    const createInput: typeof CreateProductInput._type = {
      name: 'Test',
      description: 'Test description',
      price: 10,
      categoryId: validUuid,
    }

    const updateInput: typeof UpdateProductInput._type = {
      name: 'Updated name',
      // Otros campos son opcionales
    }

    const response: typeof ProductResponse._type = {
      id: validUuid,
      name: 'Test',
      description: 'Test description',
      price: 10,
      categoryId: validUuid,
    }

    const listResponse: typeof ProductListResponse._type = [response]

    // Si el código compila, los tipos son correctos
    expect(createInput).toBeDefined()
    expect(updateInput).toBeDefined()
    expect(response).toBeDefined()
    expect(listResponse).toBeDefined()
  })
})
