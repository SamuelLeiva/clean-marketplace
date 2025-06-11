// import { describe, it, expect, beforeEach } from 'vitest'
import { DeleteProduct } from '@/core/use-cases/product'
import { Product } from '@/core/entities/Product'
import { ProductRepository } from '@/core/ports/ProductRepository'
import { CannotDeleteProductError } from '@/core/errors/product/CannotDeleteProductError'
import { beforeEach, describe, expect, it } from 'vitest'

describe('DeleteProduct Use Case', () => {
  let mockRepo: ProductRepository
  let useCase: DeleteProduct
  const productId = 'product-123'

  const mockProduct: Product = {
    id: productId,
    name: 'To Delete',
    description: 'To be removed',
    price: 15,
    categoryId: 'cat-1',
  }

  beforeEach(() => {
    mockRepo = {
      create: async () => mockProduct,
      findById: async () => mockProduct,
      findAll: async () => [],
      update: async () => mockProduct,
      delete: async () => {},
      findByName: async () => null,
      isInUse: async () => false,
    }

    useCase = new DeleteProduct(mockRepo)
  })

  it('should delete the product if it exists and is not in use', async () => {
    await expect(useCase.execute(productId)).resolves.not.toThrow()
  })

  it('should throw CannotDeleteProductError if product is in use', async () => {
    mockRepo.isInUse = async () => true

    await expect(() => useCase.execute(productId)).rejects.toThrow(CannotDeleteProductError)
  })
})
