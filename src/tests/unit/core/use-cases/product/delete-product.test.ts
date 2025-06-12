import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DeleteProduct } from '@/core/use-cases/product'
import { ProductNotFoundError, CannotDeleteProductError } from '@/core/errors/product'
import { ProductRepository } from '@/core/ports'
import { Product } from '@/core/entities'

describe('DeleteProduct Use Case', () => {
  let deleteProduct: DeleteProduct
  let mockRepo: ProductRepository

  beforeEach(() => {
    mockRepo = {
      findByName: vi.fn(),
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      isInUse: vi.fn()
    }

    deleteProduct = new DeleteProduct(mockRepo)
    vi.clearAllMocks()
  })

  describe('Successful deletion', () => {
    it('should delete product when it exists and is not in use', async () => {
      // Arrange
      const productId = 'prod-001'
      const existingProduct: Product = { id: productId } as Product

      vi.mocked(mockRepo.findById).mockResolvedValue(existingProduct)
      vi.mocked(mockRepo.isInUse).mockResolvedValue(false)
      vi.mocked(mockRepo.delete).mockResolvedValue()

      // Act
      await deleteProduct.execute(productId)

      // Assert
      expect(mockRepo.findById).toHaveBeenCalledWith(productId)
      expect(mockRepo.isInUse).toHaveBeenCalledWith(productId)
      expect(mockRepo.delete).toHaveBeenCalledWith(productId)
    })
  })

  describe('Product not found scenarios', () => {
    it('should throw ProductNotFoundError if product does not exist', async () => {
      // Arrange
      const productId = 'missing-id'
      vi.mocked(mockRepo.findById).mockResolvedValue(null)

      // Act & Assert
      await expect(deleteProduct.execute(productId)).rejects.toThrow(ProductNotFoundError)
      await expect(deleteProduct.execute(productId)).rejects.toThrow(`Product with id ${productId} not found`)

      expect(mockRepo.isInUse).not.toHaveBeenCalled()
      expect(mockRepo.delete).not.toHaveBeenCalled()
    })
  })

  describe('Product in use scenarios', () => {
    it('should throw CannotDeleteProductError if product is currently in use', async () => {
      // Arrange
      const productId = 'prod-002'
      const product: Product = { id: productId } as Product

      vi.mocked(mockRepo.findById).mockResolvedValue(product)
      vi.mocked(mockRepo.isInUse).mockResolvedValue(true)

      // Act & Assert
      await expect(deleteProduct.execute(productId)).rejects.toThrow(CannotDeleteProductError)
      await expect(deleteProduct.execute(productId)).rejects.toThrow(`Cannot delete product ${productId} because it is in use`)

      expect(mockRepo.delete).not.toHaveBeenCalled()
    })
  })

  describe('Repository failure handling', () => {
    it('should propagate errors from findById', async () => {
      // Arrange
      const productId = 'prod-003'
      const dbError = new Error('Database down')

      vi.mocked(mockRepo.findById).mockRejectedValue(dbError)

      // Act & Assert
      await expect(deleteProduct.execute(productId)).rejects.toThrow('Database down')

      expect(mockRepo.isInUse).not.toHaveBeenCalled()
      expect(mockRepo.delete).not.toHaveBeenCalled()
    })

    it('should propagate errors from isInUse', async () => {
      // Arrange
      const productId = 'prod-004'
      const product: Product = { id: productId } as Product
      const usageCheckError = new Error('Failed to check usage')

      vi.mocked(mockRepo.findById).mockResolvedValue(product)
      vi.mocked(mockRepo.isInUse).mockRejectedValue(usageCheckError)

      // Act & Assert
      await expect(deleteProduct.execute(productId)).rejects.toThrow('Failed to check usage')

      expect(mockRepo.delete).not.toHaveBeenCalled()
    })

    it('should propagate errors from delete operation', async () => {
      // Arrange
      const productId = 'prod-005'
      const product: Product = { id: productId } as Product
      const deletionError = new Error('Deletion failed')

      vi.mocked(mockRepo.findById).mockResolvedValue(product)
      vi.mocked(mockRepo.isInUse).mockResolvedValue(false)
      vi.mocked(mockRepo.delete).mockRejectedValue(deletionError)

      // Act & Assert
      await expect(deleteProduct.execute(productId)).rejects.toThrow('Deletion failed')
    })
  })

  describe('Execution flow verification', () => {
    it('should call repository methods in correct order', async () => {
      // Arrange
      const productId = 'prod-006'
      const product: Product = { id: productId } as Product
      const calls: string[] = []

      vi.mocked(mockRepo.findById).mockImplementation(async () => {
        calls.push('findById')
        return product
      })

      vi.mocked(mockRepo.isInUse).mockImplementation(async () => {
        calls.push('isInUse')
        return false
      })

      vi.mocked(mockRepo.delete).mockImplementation(async () => {
        calls.push('delete')
      })

      // Act
      await deleteProduct.execute(productId)

      // Assert
      expect(calls).toEqual(['findById', 'isInUse', 'delete'])
    })
  })
})
