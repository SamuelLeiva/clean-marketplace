import { describe, it, expect, vi } from 'vitest'
import { v4 as uuidv4 } from 'uuid'
import { Product } from '@/core/entities/Product'
import { ProductRepository } from '@/core/ports/ProductRepository'
import { GetAllProducts } from '@/core/use-cases/product'

describe('ListProductsUseCase', () => {
  const mockProducts: Product[] = [
    {
      id: uuidv4(),
      name: 'Producto A',
      description: 'Descripción A',
      price: 25,
      categoryId: uuidv4(),
    },
    {
      id: uuidv4(),
      name: 'Producto B',
      description: 'Descripción B',
      price: 35,
      categoryId: uuidv4(),
    },
  ]

  const mockRepo: ProductRepository = {
    create: vi.fn(),
    findById: vi.fn(),
    findAll: vi.fn(
        async () => mockProducts
    ),
    update: vi.fn(),
    delete: vi.fn(),
    findByName: vi.fn(),
    isInUse: vi.fn(),
  }

  const useCase = new GetAllProducts(mockRepo)

  it('should return all products', async () => {
    const result = await useCase.execute()
    expect(result).toEqual(mockProducts)
    expect(Array.isArray(result)).toBe(true)
    expect(mockRepo.findAll).toHaveBeenCalled()
  })
})
