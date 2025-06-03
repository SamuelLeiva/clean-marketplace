import { describe, it, expect, beforeEach } from 'vitest'
import { v4 as uuidv4 } from 'uuid'

import { Product } from '@/core/entities/Product'
import { ProductRepository } from '@/core/ports/ProductRepository'
import { GetProductById } from '@/core/use-cases/product'
import { ProductNotFoundError } from '@/core/errors/ProductNotFoundError'

describe('GetProductById Use Case', () => {
  let mockRepo: ProductRepository
  let useCase: GetProductById
  const exampleId = uuidv4()

  const mockProduct: Product = {
    id: exampleId,
    name: 'Test Product',
    description: 'A sample description',
    price: 99.99,
    categoryId: uuidv4(),
  }

  beforeEach(() => {
    mockRepo = {
      create: async () => { throw new Error('not implemented') },
      findById: async () => null, // se sobrescribirá por test
      findAll: async () => [],
      update: async () => { throw new Error('not implemented') },
      delete: async () => { throw new Error('not implemented') },
      findByName: async () => null,
      isInUse: async () => false,
    }

    useCase = new GetProductById(mockRepo)
  })

  it('should return the product if it exists', async () => {
    // sobrescribimos solo la función findById
    mockRepo.findById = async () => mockProduct

    const result = await useCase.execute(exampleId)

    expect(result).toEqual(mockProduct)
  })

  it('should throw ProductNotFoundError if the product does not exist', async () => {
    mockRepo.findById = async () => null

    await expect(() => useCase.execute(exampleId)).rejects.toThrow(ProductNotFoundError)
    await expect(() => useCase.execute(exampleId)).rejects.toThrow(`Product with ID ${exampleId} was not found`)
  })
})
