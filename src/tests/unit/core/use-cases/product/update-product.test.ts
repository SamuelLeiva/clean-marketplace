import { describe, it, expect, vi, beforeEach } from 'vitest'
import { UpdateProduct } from '@/core/use-cases/product' // Adjust path as needed
import { ProductRepository } from '@/core/ports' // Adjust path as needed
import { Product } from '@/core/entities'
import { ProductNotFoundError } from '@/core/errors/product' // Ensure this error is defined
import { UpdateProductInput } from '@/shared/contracts' // Import the UpdateProductInput contract

describe('UpdateProduct Use Case', () => {
  let updateProduct: UpdateProduct
  let mockRepo: ProductRepository

  // An existing product for testing updates
  const existingProduct: Product = {
    id: 'product-to-update-123',
    name: 'Auriculares Bluetooth',
    description: 'Auriculares inalámbricos con cancelación de ruido.',
    price: 120.0,
    categoryId: 'audio-accessories-cat',
    createdAt: '2024-01-01T08:00:00.000Z',
    updatedAt: '2024-01-01T08:00:00.000Z',
  }

  beforeEach(() => {
    // Create fresh mocks for each test
    mockRepo = {
      create: vi.fn(),
      findById: vi.fn(), // Mock for finding the product
      findAll: vi.fn(),
      update: vi.fn(), // Mock for updating the product
      delete: vi.fn(),
      findByName: vi.fn(),
      isInUse: vi.fn(),
    }

    updateProduct = new UpdateProduct(mockRepo)

    // Clear all mocks before each test
    vi.clearAllMocks()
  })

  // Successful Product Update

  it('should update and return the product with new name and description if it exists', async () => {
    // Arrange
    const updateInput: UpdateProductInput = {
      name: 'Auriculares Inalámbricos Pro',
      description:
        'Auriculares de alta fidelidad con cancelación de ruido avanzada.',
    }
    // The expected product after update (simulating repository's return value)
    const updatedProduct: Product = {
      ...existingProduct,
      ...updateInput,
      updatedAt: '2024-06-13T13:00:00.000Z', // Simulate updatedAt changing
    }

    // Mock: product exists
    vi.mocked(mockRepo.findById).mockResolvedValue(existingProduct)
    // Mock: update is successful and returns the updated product
    vi.mocked(mockRepo.update).mockResolvedValue(updatedProduct)

    // Act
    const result = await updateProduct.execute(existingProduct.id, updateInput)

    // Assert
    expect(mockRepo.findById).toHaveBeenCalledOnce()
    expect(mockRepo.findById).toHaveBeenCalledWith(existingProduct.id)
    expect(mockRepo.update).toHaveBeenCalledOnce()
    expect(mockRepo.update).toHaveBeenCalledWith(
      existingProduct.id,
      updateInput,
    )

    expect(result).not.toBeNull()
    expect(result.id).toBe(existingProduct.id)
    expect(result.name).toBe(updateInput.name)
    expect(result.description).toBe(updateInput.description)
    expect(result.price).toBe(existingProduct.price) // Price not updated
    expect(result.categoryId).toBe(existingProduct.categoryId) // Category not updated
    expect(result.createdAt).toBe(existingProduct.createdAt) // createdAt should remain the same
    expect(result.updatedAt).toBe(updatedProduct.updatedAt) // updatedAt should change
    expect(result).toEqual(updatedProduct)
  })

  it('should update only the provided fields and keep others intact', async () => {
    // Arrange
    const updateInput: UpdateProductInput = { price: 150.0 } // Only updating price
    const updatedProduct: Product = {
      ...existingProduct,
      ...updateInput,
      updatedAt: '2024-06-13T13:05:00.000Z',
    }

    vi.mocked(mockRepo.findById).mockResolvedValue(existingProduct)
    vi.mocked(mockRepo.update).mockResolvedValue(updatedProduct)

    // Act
    const result = await updateProduct.execute(existingProduct.id, updateInput)

    // Assert
    expect(mockRepo.findById).toHaveBeenCalledOnce()
    expect(mockRepo.findById).toHaveBeenCalledWith(existingProduct.id)
    expect(mockRepo.update).toHaveBeenCalledOnce()
    expect(mockRepo.update).toHaveBeenCalledWith(
      existingProduct.id,
      updateInput,
    )

    expect(result.id).toBe(existingProduct.id)
    expect(result.name).toBe(existingProduct.name) // Name should remain unchanged
    expect(result.description).toBe(existingProduct.description) // Description unchanged
    expect(result.price).toBe(updateInput.price) // Price should be updated
    expect(result.categoryId).toBe(existingProduct.categoryId) // Category unchanged
    expect(result.updatedAt).toBe(updatedProduct.updatedAt)
  })

  it('should handle updates with minimal valid input values for changed fields', async () => {
    // Arrange
    const updateInput: UpdateProductInput = {
      name: 'P C', // Min 3 chars for name
      description: 'Minimal description.', // Min 10 chars for description
      price: 0.01, // Positive price
      categoryId: 'new-valid-uuid-1234-abcd', // Valid UUID
    }
    const updatedProduct: Product = {
      ...existingProduct,
      ...updateInput,
      updatedAt: '2024-06-13T13:10:00.000Z',
    }

    vi.mocked(mockRepo.findById).mockResolvedValue(existingProduct)
    vi.mocked(mockRepo.update).mockResolvedValue(updatedProduct)

    // Act
    const result = await updateProduct.execute(existingProduct.id, updateInput)

    // Assert
    expect(result.name).toBe(updateInput.name)
    expect(result.description).toBe(updateInput.description)
    expect(result.price).toBe(updateInput.price)
    expect(result.categoryId).toBe(updateInput.categoryId)
  })

  it('should handle updates with maximal valid input values for changed fields', async () => {
    // Arrange
    const updateInput: UpdateProductInput = {
      name: 'A'.repeat(100), // Max 100 chars
      description: 'B'.repeat(500), // Max 500 chars
      price: 999999999.99, // Large positive price
      categoryId: 'another-long-uuid-abcd-efgh-ijkl',
    }
    const updatedProduct: Product = {
      ...existingProduct,
      ...updateInput,
      updatedAt: '2024-06-13T13:15:00.000Z',
    }

    vi.mocked(mockRepo.findById).mockResolvedValue(existingProduct)
    vi.mocked(mockRepo.update).mockResolvedValue(updatedProduct)

    // Act
    const result = await updateProduct.execute(existingProduct.id, updateInput)

    // Assert
    expect(result.name).toBe(updateInput.name)
    expect(result.description).toBe(updateInput.description)
    expect(result.price).toBe(updateInput.price)
    expect(result.categoryId).toBe(updateInput.categoryId)
  })

  //  Handling Product Not Found

  it('should throw ProductNotFoundError if the product to update does not exist', async () => {
    // Arrange
    const nonExistentId = 'non-existent-product-id'
    const updateInput: UpdateProductInput = { name: 'New Product Name' }
    // Mock: findById returns null
    vi.mocked(mockRepo.findById).mockResolvedValue(null)

    // Act & Assert
    await expect(
      updateProduct.execute(nonExistentId, updateInput),
    ).rejects.toThrow(ProductNotFoundError)
    await expect(
      updateProduct.execute(nonExistentId, updateInput),
    ).rejects.toThrow(`Product with ID ${nonExistentId} was not found`)
    expect(mockRepo.findById).toHaveBeenCalled()
    expect(mockRepo.findById).toHaveBeenCalledWith(nonExistentId)
    expect(mockRepo.update).not.toHaveBeenCalled() // update should not be called
  })

  //  Repository Error Handling

  it('should propagate repository findById errors', async () => {
    // Arrange
    const updateInput: UpdateProductInput = { name: 'Propagate Error Test' }
    const repositoryError = new Error(
      'Database connection failed during findById',
    )
    vi.mocked(mockRepo.findById).mockRejectedValue(repositoryError)

    // Act & Assert
    await expect(
      updateProduct.execute(existingProduct.id, updateInput),
    ).rejects.toThrow('Database connection failed during findById')
    expect(mockRepo.findById).toHaveBeenCalledOnce()
    expect(mockRepo.update).not.toHaveBeenCalled()
  })

  it('should propagate repository update errors', async () => {
    // Arrange
    const updateInput: UpdateProductInput = { description: 'Failed update' }
    const repositoryError = new Error('Failed to save product changes')
    vi.mocked(mockRepo.findById).mockResolvedValue(existingProduct)
    vi.mocked(mockRepo.update).mockRejectedValue(repositoryError)

    // Act & Assert
    await expect(
      updateProduct.execute(existingProduct.id, updateInput),
    ).rejects.toThrow('Failed to save product changes')
    expect(mockRepo.findById).toHaveBeenCalledOnce()
    expect(mockRepo.update).toHaveBeenCalledOnce() // The update was attempted and failed
  })

  //  Method Call Sequence

  it('should call repository methods in correct order for a successful update', async () => {
    // Arrange
    const updateInput: UpdateProductInput = { name: 'Sequence Updated Product' }
    const updatedProduct = {
      ...existingProduct,
      ...updateInput,
      updatedAt: '2024-06-13T13:20:00.000Z',
    }

    vi.mocked(mockRepo.findById).mockResolvedValue(existingProduct)
    vi.mocked(mockRepo.update).mockResolvedValue(updatedProduct)

    // Act
    await updateProduct.execute(existingProduct.id, updateInput)

    // Assert
    const findByIdCall = vi.mocked(mockRepo.findById).mock.calls[0]
    const updateCall = vi.mocked(mockRepo.update).mock.calls[0]

    expect(findByIdCall).toBeDefined()
    expect(updateCall).toBeDefined()

    // Verify that findById was called before update
    expect(vi.mocked(mockRepo.findById)).toHaveBeenCalledBefore(
      vi.mocked(mockRepo.update),
    )

    // Ensure only these methods were called
    expect(mockRepo.findById).toHaveBeenCalledOnce()
    expect(mockRepo.update).toHaveBeenCalledOnce()
    expect(mockRepo.create).not.toHaveBeenCalled()
    expect(mockRepo.findAll).not.toHaveBeenCalled()
    expect(mockRepo.delete).not.toHaveBeenCalled()
    expect(mockRepo.findByName).not.toHaveBeenCalled()
    expect(mockRepo.isInUse).not.toHaveBeenCalled()
  })

  it('should not call update if product is not found', async () => {
    // Arrange
    const nonExistentId = 'non-existent-id-sequence'
    const updateInput: UpdateProductInput = { name: 'New Name' }
    vi.mocked(mockRepo.findById).mockResolvedValue(null)

    // Act & Assert
    await expect(
      updateProduct.execute(nonExistentId, updateInput),
    ).rejects.toThrow(ProductNotFoundError)

    expect(mockRepo.findById).toHaveBeenCalledOnce()
    expect(mockRepo.update).not.toHaveBeenCalled()
  })
})
