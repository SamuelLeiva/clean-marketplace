// tests/integration/api/product/post-product.test.ts
import { describe, it, expect, beforeAll } from 'vitest'
import { PrismaClient } from '@prisma/client'
import { POST } from '@/app/api/products/route'

const prisma = new PrismaClient()

describe('POST /api/product', () => {
  let categoryId: string

  beforeAll(async () => {
    await prisma.product.deleteMany()
    await prisma.category.deleteMany()

    const category = await prisma.category.create({
      data: { name: 'Accessories' },
    })

    categoryId = category.id
  })

  it('should create a new product', async () => {
    const body = {
      name: 'Headphones',
      price: 49.99,
      description: 'Noise-cancelling headphones',
      categoryId,
    }

    const request = new Request('http://localhost/api/product', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data).toMatchObject({
      name: 'Headphones',
      price: 49.99,
      categoryId,
    })
    expect(data).toHaveProperty('id')
  })
})
