import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CreateProduct } from '@/core/use-cases/product' // Adjust path as needed
import { ProductRepository } from '@/core/ports' // Adjust path as needed
import { Product } from '@/core/entities'
import { CreateProductInput } from '@/shared/contracts' // Import the specific input type
import { ProductAlreadyExistsError } from '@/core/errors/product' // Ensure this error is defined

// Note: No need to mock 'crypto' randomUUID here, as the use case doesn't generate the ID.
// The repository is assumed to generate it and the timestamps.

describe('CreateProduct Use Case', () => {
  let createProduct: CreateProduct
  let mockRepo: ProductRepository

  // A constant ID for the created product, as returned by the mock repository
  const mockGeneratedId = 'new-product-id-abc'
  const mockCreatedAt = '2025-06-13T10:00:00.000Z'
  const mockUpdatedAt = '2025-06-13T10:00:00.000Z' // Initially same as createdAt

  beforeEach(() => {
    // Create fresh mocks for each test
    mockRepo = {
      findByName: vi.fn(), // Mock for checking existing products
      create: vi.fn(), // Mock for creating the product
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      isInUse: vi.fn(),
    }

    createProduct = new CreateProduct(mockRepo)

    // Clear all mocks before each test
    vi.clearAllMocks()
  })

  // Successful Product Creation

  it('should create a new product when its name does not exist', async () => {
    // Arrange
    const input: CreateProductInput = {
      name: 'Smart TV 65"',
      description: 'Ultra HD TV with smart features and voice control.',
      price: 1299.99,
      categoryId: 'category-tv-123',
    }

    // The full Product object that the repository mock will return after creation
    const createdProduct: Product = {
      id: mockGeneratedId,
      ...input,
      createdAt: mockCreatedAt,
      updatedAt: mockUpdatedAt,
    }

    // Mock: Product does not exist by name
    vi.mocked(mockRepo.findByName).mockResolvedValue(null)
    // Mock: Creation is successful and returns the full Product entity
    vi.mocked(mockRepo.create).mockResolvedValue(createdProduct)

    // Act
    const result = await createProduct.execute(input)

    // Assert
    expect(mockRepo.findByName).toHaveBeenCalledOnce()
    expect(mockRepo.findByName).toHaveBeenCalledWith(input.name)

    expect(mockRepo.create).toHaveBeenCalledOnce()
    // The use case passes the exact input to the repository's create method
    expect(mockRepo.create).toHaveBeenCalledWith(input)

    // The result should be the full Product entity returned by the repository
    expect(result).toEqual(createdProduct)
    expect(result.id).toBe(mockGeneratedId)
    expect(result.createdAt).toBe(mockCreatedAt)
    expect(result.updatedAt).toBe(mockUpdatedAt)
  })

  it('should create a product with minimum valid input values', async () => {
    // Arrange
    const input: CreateProductInput = {
      name: 'ABC', // Min 3 chars
      description: 'This is a description with at least ten characters.', // Min 10 chars
      price: 0.01, // Positive price
      categoryId: 'valid-uuid-123e-4567-a89b', // Valid UUID
    }
    const createdProduct: Product = {
      id: mockGeneratedId,
      ...input,
      createdAt: mockCreatedAt,
      updatedAt: mockUpdatedAt,
    }

    vi.mocked(mockRepo.findByName).mockResolvedValue(null)
    vi.mocked(mockRepo.create).mockResolvedValue(createdProduct)

    // Act
    const result = await createProduct.execute(input)

    // Assert
    expect(mockRepo.create).toHaveBeenCalledWith(input)
    expect(result.name).toBe(input.name)
    expect(result.description).toBe(input.description)
    expect(result.price).toBe(input.price)
  })

  it('should create a product with maximum valid input values', async () => {
    // Arrange
    const input: CreateProductInput = {
      name: 'A'.repeat(100), // Max 100 chars
      description: 'B'.repeat(500), // Max 500 chars
      price: 999999999.99, // Large positive price
      categoryId: 'valid-uuid-abcd-efgh-ijkl',
    }
    const createdProduct: Product = {
      id: mockGeneratedId,
      ...input,
      createdAt: mockCreatedAt,
      updatedAt: mockUpdatedAt,
    }

    vi.mocked(mockRepo.findByName).mockResolvedValue(null)
    vi.mocked(mockRepo.create).mockResolvedValue(createdProduct)

    // Act
    const result = await createProduct.execute(input)

    // Assert
    expect(mockRepo.create).toHaveBeenCalledWith(input)
    expect(result.name).toBe(input.name)
    expect(result.description).toBe(input.description)
    expect(result.price).toBe(input.price)
  })

  // Product Already Exists Scenarios

  it('should throw ProductAlreadyExistsError when a product with the same name already exists', async () => {
    // Arrange
    const input: CreateProductInput = {
      name: 'Existing Product Name',
      description: 'Description for an existing product.',
      price: 100.0,
      categoryId: 'cat-id-exists-1',
    }

    const existingProduct: Product = {
      id: 'existing-prod-id',
      name: 'Existing Product Name',
      description: 'Original description',
      price: 50.0,
      categoryId: 'cat-id-exists-2',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    }

    // Mock: Product with this name already exists
    vi.mocked(mockRepo.findByName).mockResolvedValue(existingProduct)

    // Act & Assert
    await expect(createProduct.execute(input)).rejects.toThrow(
      ProductAlreadyExistsError,
    )
    await expect(createProduct.execute(input)).rejects.toThrow(
      `Product with name ${input.name} already exists`,
    )
    expect(mockRepo.findByName).toHaveBeenCalled()
    expect(mockRepo.findByName).toHaveBeenCalledWith(input.name)
    expect(mockRepo.create).not.toHaveBeenCalled() // Create should NOT be called if product exists
  })

  it('should not call create when a product with the same name already exists', async () => {
    // Arrange
    const input: CreateProductInput = {
      name: 'Duplicate Product',
      description: 'Another duplicate product.',
      price: 25.0,
      categoryId: 'cat-dup-id',
    }
    const existingProduct: Product = {
      id: 'dup-prod-id',
      ...input,
      createdAt: '2025-01-02T00:00:00.000Z',
      updatedAt: '2025-01-02T00:00:00.000Z',
    }

    vi.mocked(mockRepo.findByName).mockResolvedValue(existingProduct)

    // Act
    try {
      await createProduct.execute(input)
    } catch (error) {
      // Catch error to allow assertions on mock calls
      expect(error).toBeInstanceOf(ProductAlreadyExistsError)
    }

    // Assert
    expect(mockRepo.findByName).toHaveBeenCalledOnce()
    expect(mockRepo.create).not.toHaveBeenCalled()
  })

  // Repository Error Handling

  it('should propagate repository findByName errors', async () => {
    // Arrange
    const input: CreateProductInput = {
      name: 'Error Test Product',
      description: 'Description for error test.',
      price: 10.0,
      categoryId: 'cat-error-id',
    }
    const repositoryError = new Error(
      'Database connection failed during findByName',
    )
    vi.mocked(mockRepo.findByName).mockRejectedValue(repositoryError)

    // Act & Assert
    await expect(createProduct.execute(input)).rejects.toThrow(
      'Database connection failed during findByName',
    )
    expect(mockRepo.findByName).toHaveBeenCalledOnce()
    expect(mockRepo.create).not.toHaveBeenCalled() // Create should not be called
  })

  it('should propagate repository create errors', async () => {
    // Arrange
    const input: CreateProductInput = {
      name: 'Failed Create Product',
      description: 'Product that will fail on creation.',
      price: 20.0,
      categoryId: 'cat-fail-id',
    }
    const repositoryError = new Error('Failed to save product in database')
    vi.mocked(mockRepo.findByName).mockResolvedValue(null) // Product name is unique
    vi.mocked(mockRepo.create).mockRejectedValue(repositoryError) // Simulate creation failure

    // Act & Assert
    await expect(createProduct.execute(input)).rejects.toThrow(
      'Failed to save product in database',
    )
    expect(mockRepo.findByName).toHaveBeenCalledOnce()
    expect(mockRepo.create).toHaveBeenCalledOnce() // Create was attempted and failed
    expect(mockRepo.create).toHaveBeenCalledWith(input)
  })

  // Method Call Sequence

  it('should call repository methods in the correct order for successful creation', async () => {
    // Arrange
    const input: CreateProductInput = {
      name: 'Sequence Product',
      description: 'Testing call sequence.',
      price: 5.0,
      categoryId: 'cat-seq-id',
    }
    const createdProduct: Product = {
      id: mockGeneratedId,
      ...input,
      createdAt: mockCreatedAt,
      updatedAt: mockUpdatedAt,
    }

    vi.mocked(mockRepo.findByName).mockResolvedValue(null)
    vi.mocked(mockRepo.create).mockResolvedValue(createdProduct)

    // Act
    await createProduct.execute(input)

    // Assert
    const findByNameCall = vi.mocked(mockRepo.findByName).mock.calls[0]
    const createCall = vi.mocked(mockRepo.create).mock.calls[0]

    expect(findByNameCall).toBeDefined()
    expect(createCall).toBeDefined()

    // Verify findByName is called before create
    expect(vi.mocked(mockRepo.findByName)).toHaveBeenCalledBefore(
      vi.mocked(mockRepo.create),
    )

    // Ensure only these methods were called
    expect(mockRepo.findByName).toHaveBeenCalledOnce()
    expect(mockRepo.create).toHaveBeenCalledOnce()
    expect(mockRepo.findById).not.toHaveBeenCalled()
    expect(mockRepo.findAll).not.toHaveBeenCalled()
    expect(mockRepo.update).not.toHaveBeenCalled()
    expect(mockRepo.delete).not.toHaveBeenCalled()
    expect(mockRepo.isInUse).not.toHaveBeenCalled()
  })

  it('should only call findByName if product already exists', async () => {
    // Arrange
    const input: CreateProductInput = {
      name: 'Only FindByName',
      description: 'Product for checking call order.',
      price: 1.0,
      categoryId: 'cat-only-find-id',
    }
    const existingProduct: Product = {
      id: 'existing-id-call',
      ...input,
      createdAt: '2025-01-03T00:00:00.000Z',
      updatedAt: '2025-01-03T00:00:00.000Z',
    }

    vi.mocked(mockRepo.findByName).mockResolvedValue(existingProduct)

    // Act
    try {
      await createProduct.execute(input)
    } catch {
      // Catch error to allow assertions on mock calls
    }

    // Assert
    expect(mockRepo.findByName).toHaveBeenCalledOnce()
    expect(mockRepo.create).not.toHaveBeenCalled()
  })
})
