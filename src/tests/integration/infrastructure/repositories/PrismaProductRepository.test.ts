import { describe, it, expect } from 'vitest'
import { PrismaClient } from '@prisma/client'
import { PrismaProductRepository } from '@/infrastructure/database/prisma'

const prisma = new PrismaClient()
const repo = new PrismaProductRepository()

describe('PrismaProductRepository Integration', () => {
  // beforeAll(async () => {
  //   await prisma.$connect()
  // })

  // afterAll(async () => {
  //   await prisma.$disconnect()
  // })

  // beforeEach(async () => {
  //   await prisma.product.deleteMany()
  //   await prisma.category.deleteMany()
  // })

  it('should create and find a product by id', async () => {
    const category = await prisma.category.create({
      data: { name: 'Electronics' },
    })

    const created = await repo.create({
      name: 'Laptop',
      price: 1200,
      description: 'High-end laptop',
      categoryId: category.id,
    })

    const found = await repo.findById(created.id)

    expect(found).toEqual(created)
  })

  it('should return null if product not found', async () => {
    const result = await repo.findById('non-existent-id')
    expect(result).toBeNull()
  })

  it('should update a product', async () => {
    const category = await prisma.category.create({
      data: { name: 'Books' },
    })

    const created = await repo.create({
      name: 'Book A',
      price: 10,
      description: 'Old book',
      categoryId: category.id,
    })

    const updated = await repo.update(created.id, {
      name: 'Book B',
      price: 12,
    })

    expect(updated.name).toBe('Book B')
    expect(updated.price).toBe(12)
  })

  it('should delete a product', async () => {
    const category = await prisma.category.create({
      data: { name: 'Home' },
    })

    const created = await repo.create({
      name: 'Chair',
      price: 80,
      description: 'Wooden chair',
      categoryId: category.id,
    })

    await repo.delete(created.id)

    const result = await repo.findById(created.id)
    expect(result).toBeNull()
  })
})
