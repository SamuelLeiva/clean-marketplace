import { describe, it, expect, beforeEach } from 'vitest'
import { UpdateProduct } from '@/core/use-cases/product'
import { Product } from '@/core/entities/Product'
import { ProductRepository } from '@/core/ports/ProductRepository'
import { InvalidProductDataError } from '@/core/errors/InvalidProductDataError'

const existingProduct: Product = {
  id: 'product-id',
  name: 'Existing Product',
  description: 'Description',
  price: 100,
  categoryId: 'category-id',
}

describe('UpdateProduct Use Case', () => {
  let mockRepo: ProductRepository
  let useCase: UpdateProduct

  beforeEach(() => {
    mockRepo = {
      create: async () => existingProduct,
      findById: async () => existingProduct,
      findAll: async () => [],
      update: async (_, data) => ({ ...existingProduct, ...data }),
      delete: async () => {},
      findByName: async () => null,
      isInUse: async () => false,
    }

    useCase = new UpdateProduct(mockRepo)
  })

  it('should update and return the product if it exists and data is valid', async () => {
    const result = await useCase.execute(existingProduct.id, { name: 'Updated', price: 150 })
    expect(result.name).toBe('Updated')
    expect(result.price).toBe(150)
  })

  it('should throw InvalidProductDataError if price is negative', async () => {
    await expect(() =>
      useCase.execute(existingProduct.id, { price: -20 })
    ).rejects.toThrow(InvalidProductDataError)
  })
})
