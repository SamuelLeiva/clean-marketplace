import { describe, it, expect, vi, beforeEach } from 'vitest'
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
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findByName: vi.fn(),
      isInUse: vi.fn(),
    }

    useCase = new GetProductById(mockRepo)
  })

  it('should return the product if it exists', async () => {
    (mockRepo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(mockProduct)

    const result = await useCase.execute(exampleId)

    expect(result).toEqual(mockProduct)
    expect(mockRepo.findById).toHaveBeenCalledWith(exampleId)
    expect(mockRepo.findById).toHaveBeenCalledTimes(1)
  })

  it('should throw ProductNotFoundError if the product does not exist', async () => {
    (mockRepo.findById as ReturnType<typeof vi.fn>).mockResolvedValue(null)

    await expect(() => useCase.execute(exampleId)).rejects.toThrow(ProductNotFoundError)
    await expect(() => useCase.execute(exampleId)).rejects.toThrow(`Product with ID ${exampleId} not found`)
    expect(mockRepo.findById).toHaveBeenCalledWith(exampleId)
  })
})
