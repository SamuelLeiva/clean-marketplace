import { describe, it, expect, beforeEach } from 'vitest'
import { v4 as uuidv4 } from 'uuid'

import { CreateProduct } from '@/core/use-cases/product'
import { Product } from '@/core/entities/Product'
import { ProductRepository } from '@/core/ports/ProductRepository'

describe('CreateProduct Use Case', () => {
  let mockRepo: ProductRepository
  let useCase: CreateProduct

  const newProduct: Product = {
    id: uuidv4(),
    name: 'New Product',
    description: 'A great product',
    price: 49.99,
    categoryId: uuidv4(),
  }

  beforeEach(() => {
    mockRepo = {
      create: async () => newProduct,
      findById: async () => null,
      findAll: async () => [],
      update: async () => newProduct,
      delete: async () => {},
      findByName: async () => null,
      isInUse: async () => false,
    }

    useCase = new CreateProduct(mockRepo)
  })

  it('should create and return the new product', async () => {
    const result = await useCase.execute(newProduct)
    expect(result).toEqual(newProduct)
  })
})
