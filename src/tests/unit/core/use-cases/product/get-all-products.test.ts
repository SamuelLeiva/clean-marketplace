import { describe, it, expect, beforeEach } from 'vitest'
import { GetAllProducts } from '@/core/use-cases/product'
import { Product } from '@/core/entities/Product'
import { ProductRepository } from '@/core/ports/ProductRepository'
import { v4 as uuidv4 } from 'uuid'

describe('GetAllProducts Use Case', () => {
  let mockRepo: ProductRepository
  let useCase: GetAllProducts

  const mockProducts: Product[] = [
    {
      id: uuidv4(),
      name: 'Product A',
      description: 'Desc A',
      price: 10,
      categoryId: uuidv4(),
    },
    {
      id: uuidv4(),
      name: 'Product B',
      description: 'Desc B',
      price: 20,
      categoryId: uuidv4(),
    },
  ]

  beforeEach(() => {
    mockRepo = {
      create: async () => mockProducts[0],
      findById: async () => mockProducts[0],
      findAll: async () => mockProducts,
      update: async () => mockProducts[0],
      delete: async () => {},
      findByName: async () => null,
      isInUse: async () => false,
    }

    useCase = new GetAllProducts(mockRepo)
  })

  it('should return all products', async () => {
    const result = await useCase.execute()
    expect(result).toEqual(mockProducts)
    expect(Array.isArray(result)).toBe(true)
  })
})
