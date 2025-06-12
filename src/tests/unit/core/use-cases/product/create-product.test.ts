import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CreateProduct } from '@/core/use-cases/product'
import { ProductRepository } from '@/core/ports'
import { Product } from '@/core/entities'
import { CreateProductInput } from '@/shared/contracts'
import { ProductAlreadyExistsError } from '@/core/errors/product'
import { randomUUID } from 'crypto'

// Mock del módulo crypto
vi.mock('crypto', () => ({
  randomUUID: vi.fn()
}))

describe('CreateProduct Use Case', () => {
  let createProduct: CreateProduct
  let mockRepo: ProductRepository
  const mockUUID = '123e4567-e89b-12d3-a456-426614174000'
  const validCategoryId = '123e4567-e89b-12d3-a456-426614174001'

  beforeEach(() => {
    // Crear mocks frescos para cada test
    mockRepo = {
      findByName: vi.fn(),
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      isInUse: vi.fn()
    }
    
    createProduct = new CreateProduct(mockRepo)
    
    // Configurar mock de randomUUID
    vi.mocked(randomUUID).mockReturnValue(mockUUID)
    
    // Limpiar todos los mocks
    vi.clearAllMocks()
  })

  describe('Successful product creation', () => {
    it('should create a new product when name does not exist', async () => {
      // Arrange
      const input: CreateProductInput = {
        name: 'iPhone 15',
        description: 'Latest Apple smartphone with advanced features',
        price: 999.99,
        categoryId: validCategoryId
      }

      const expectedProduct: Product = {
        id: mockUUID,
        ...input
      }

      // Mock: producto no existe
      vi.mocked(mockRepo.findByName).mockResolvedValue(null)
      // Mock: creación exitosa
      vi.mocked(mockRepo.create).mockResolvedValue(expectedProduct)

      // Act
      const result = await createProduct.execute(input)

      // Assert
      expect(mockRepo.findByName).toHaveBeenCalledOnce()
      expect(mockRepo.findByName).toHaveBeenCalledWith(input.name)
      
      expect(randomUUID).toHaveBeenCalledOnce()
      
      expect(mockRepo.create).toHaveBeenCalledOnce()
      expect(mockRepo.create).toHaveBeenCalledWith(expectedProduct)
      
      expect(result).toEqual(expectedProduct)
    })

    it('should generate unique ID for each product creation', async () => {
      // Arrange
      const input: CreateProductInput = {
        name: 'MacBook Pro',
        description: 'Professional laptop for creative professionals',
        price: 2499.99,
        categoryId: validCategoryId
      }

      const expectedProduct: Product = {
        id: mockUUID,
        ...input
      }

      vi.mocked(mockRepo.findByName).mockResolvedValue(null)
      vi.mocked(mockRepo.create).mockResolvedValue(expectedProduct)

      // Act
      await createProduct.execute(input)

      // Assert
      expect(randomUUID).toHaveBeenCalledOnce()
      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockUUID,
          name: input.name,
          description: input.description,
          price: input.price,
          categoryId: input.categoryId
        })
      )
    })

    it('should preserve all input data in created product', async () => {
      // Arrange
      const input: CreateProductInput = {
        name: 'Gaming Laptop',
        description: 'High-performance gaming laptop with RTX graphics',
        price: 1599.50,
        categoryId: validCategoryId
      }

      const expectedProduct: Product = {
        id: mockUUID,
        ...input
      }

      vi.mocked(mockRepo.findByName).mockResolvedValue(null)
      vi.mocked(mockRepo.create).mockResolvedValue(expectedProduct)

      // Act
      const result = await createProduct.execute(input)

      // Assert
      expect(result.name).toBe(input.name)
      expect(result.description).toBe(input.description)
      expect(result.price).toBe(input.price)
      expect(result.categoryId).toBe(input.categoryId)
      expect(result.id).toBe(mockUUID)
    })
  })

  describe('Product already exists scenarios', () => {
    it('should throw ProductAlreadyExistsError when product with same name exists', async () => {
      // Arrange
      const input: CreateProductInput = {
        name: 'iPhone 15',
        description: 'Latest Apple smartphone with advanced features',
        price: 999.99,
        categoryId: validCategoryId
      }

      const existingProduct: Product = {
        id: 'existing-id',
        name: 'iPhone 15',
        description: 'Existing iPhone description',
        price: 899.99,
        categoryId: validCategoryId
      }

      // Mock: producto ya existe
      vi.mocked(mockRepo.findByName).mockResolvedValue(existingProduct)

      // Act & Assert
      await expect(createProduct.execute(input)).rejects.toThrow(ProductAlreadyExistsError)
      await expect(createProduct.execute(input)).rejects.toThrow(`Product with name ${input.name} already exists`)
    })

    it('should not call create when product already exists', async () => {
      // Arrange
      const input: CreateProductInput = {
        name: 'Existing Product',
        description: 'This product already exists in the system',
        price: 299.99,
        categoryId: validCategoryId
      }

      const existingProduct: Product = {
        id: 'existing-id',
        ...input
      }

      vi.mocked(mockRepo.findByName).mockResolvedValue(existingProduct)

      // Act & Assert
      try {
        await createProduct.execute(input)
      } catch (error) {
        expect(error).toBeInstanceOf(ProductAlreadyExistsError)
      }

      expect(mockRepo.findByName).toHaveBeenCalledOnce()
      expect(mockRepo.create).not.toHaveBeenCalled()
      expect(randomUUID).not.toHaveBeenCalled()
    })

    it('should check for existing product with exact name match', async () => {
      // Arrange
      const input: CreateProductInput = {
        name: 'iPhone 15 Pro Max',
        description: 'Top tier iPhone with maximum features',
        price: 1199.99,
        categoryId: validCategoryId
      }

      const existingProduct: Product = {
        id: 'existing-id',
        name: 'iPhone 15 Pro Max',
        description: 'Different description',
        price: 999.99,
        categoryId: 'different-category'
      }

      vi.mocked(mockRepo.findByName).mockResolvedValue(existingProduct)

      // Act & Assert
      await expect(createProduct.execute(input)).rejects.toThrow(ProductAlreadyExistsError)
      expect(mockRepo.findByName).toHaveBeenCalledWith('iPhone 15 Pro Max')
    })
  })

  describe('Repository error handling', () => {
    it('should propagate repository findByName errors', async () => {
      // Arrange
      const input: CreateProductInput = {
        name: 'Test Product',
        description: 'Test product description for error handling',
        price: 99.99,
        categoryId: validCategoryId
      }

      const repositoryError = new Error('Database connection failed')
      vi.mocked(mockRepo.findByName).mockRejectedValue(repositoryError)

      // Act & Assert
      await expect(createProduct.execute(input)).rejects.toThrow('Database connection failed')
      expect(mockRepo.findByName).toHaveBeenCalledWith(input.name)
      expect(mockRepo.create).not.toHaveBeenCalled()
    })

    it('should propagate repository create errors', async () => {
      // Arrange
      const input: CreateProductInput = {
        name: 'Test Product',
        description: 'Test product description for error handling',
        price: 99.99,
        categoryId: validCategoryId
      }

      const repositoryError = new Error('Failed to save product')
      vi.mocked(mockRepo.findByName).mockResolvedValue(null)
      vi.mocked(mockRepo.create).mockRejectedValue(repositoryError)

      // Act & Assert
      await expect(createProduct.execute(input)).rejects.toThrow('Failed to save product')
      expect(mockRepo.findByName).toHaveBeenCalledWith(input.name)
      expect(mockRepo.create).toHaveBeenCalledOnce()
    })
  })

  describe('Input validation scenarios', () => {
    it('should handle products with minimum valid values', async () => {
      // Arrange
      const input: CreateProductInput = {
        name: 'Min', // 3 characters (minimum)
        description: 'Min desc!!', // 10 characters (minimum)
        price: 0.01, // minimum positive value
        categoryId: validCategoryId
      }

      const expectedProduct: Product = {
        id: mockUUID,
        ...input
      }

      vi.mocked(mockRepo.findByName).mockResolvedValue(null)
      vi.mocked(mockRepo.create).mockResolvedValue(expectedProduct)

      // Act
      const result = await createProduct.execute(input)

      // Assert
      expect(result).toEqual(expectedProduct)
      expect(mockRepo.findByName).toHaveBeenCalledWith('Min')
    })

    it('should handle products with maximum valid values', async () => {
      // Arrange
      const input: CreateProductInput = {
        name: 'A'.repeat(100), // 100 characters (maximum)
        description: 'B'.repeat(500), // 500 characters (maximum)
        price: 999999.99,
        categoryId: validCategoryId
      }

      const expectedProduct: Product = {
        id: mockUUID,
        ...input
      }

      vi.mocked(mockRepo.findByName).mockResolvedValue(null)
      vi.mocked(mockRepo.create).mockResolvedValue(expectedProduct)

      // Act
      const result = await createProduct.execute(input)

      // Assert
      expect(result).toEqual(expectedProduct)
      expect(mockRepo.findByName).toHaveBeenCalledWith(input.name)
    })

    it('should handle products with decimal prices', async () => {
      // Arrange
      const input: CreateProductInput = {
        name: 'Decimal Product',
        description: 'Product with precise decimal pricing',
        price: 123.456789,
        categoryId: validCategoryId
      }

      const expectedProduct: Product = {
        id: mockUUID,
        ...input
      }

      vi.mocked(mockRepo.findByName).mockResolvedValue(null)
      vi.mocked(mockRepo.create).mockResolvedValue(expectedProduct)

      // Act
      const result = await createProduct.execute(input)

      // Assert
      expect(result.price).toBe(123.456789)
    })
  })

  describe('Method call sequence', () => {
    it('should call repository methods in correct order', async () => {
      // Arrange
      const input: CreateProductInput = {
        name: 'Sequence Test',
        description: 'Testing method call sequence',
        price: 199.99,
        categoryId: validCategoryId
      }

      const expectedProduct: Product = {
        id: mockUUID,
        ...input
      }

      vi.mocked(mockRepo.findByName).mockResolvedValue(null)
      vi.mocked(mockRepo.create).mockResolvedValue(expectedProduct)

      // Act
      await createProduct.execute(input)

      // Assert
      const findByNameCall = vi.mocked(mockRepo.findByName).mock.calls[0]
      const createCall = vi.mocked(mockRepo.create).mock.calls[0]
      
      expect(findByNameCall).toBeDefined()
      expect(createCall).toBeDefined()
      
      // Verificar que findByName se llamó antes que create
      expect(vi.mocked(mockRepo.findByName)).toHaveBeenCalledBefore(vi.mocked(mockRepo.create))
    })

    it('should not call randomUUID when product already exists', async () => {
      // Arrange
      const input: CreateProductInput = {
        name: 'Existing Product',
        description: 'This product already exists',
        price: 99.99,
        categoryId: validCategoryId
      }

      const existingProduct: Product = {
        id: 'existing-id',
        ...input
      }

      vi.mocked(mockRepo.findByName).mockResolvedValue(existingProduct)

      // Act & Assert
      try {
        await createProduct.execute(input)
      } catch (error) {
        expect(error).toBeInstanceOf(ProductAlreadyExistsError)
      }

      expect(randomUUID).not.toHaveBeenCalled()
    })
  })

  describe('Edge cases', () => {
    it('should handle null response from findByName', async () => {
      // Arrange
      const input: CreateProductInput = {
        name: 'Null Test',
        description: 'Testing null response handling',
        price: 99.99,
        categoryId: validCategoryId
      }

      const expectedProduct: Product = {
        id: mockUUID,
        ...input
      }

      vi.mocked(mockRepo.findByName).mockResolvedValue(null)
      vi.mocked(mockRepo.create).mockResolvedValue(expectedProduct)

      // Act
      const result = await createProduct.execute(input)

      // Assert
      expect(result).toEqual(expectedProduct)
    })

    it('should handle undefined response from findByName', async () => {
      // Arrange
      const input: CreateProductInput = {
        name: 'Undefined Test',
        description: 'Testing undefined response handling',
        price: 99.99,
        categoryId: validCategoryId
      }

      const expectedProduct: Product = {
        id: mockUUID,
        ...input
      }

      vi.mocked(mockRepo.findByName).mockResolvedValue(null)
      vi.mocked(mockRepo.create).mockResolvedValue(expectedProduct)

      // Act
      const result = await createProduct.execute(input)

      // Assert
      expect(result).toEqual(expectedProduct)
    })
  })
})