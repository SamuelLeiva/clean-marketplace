import { describe, it, expect, beforeAll } from 'vitest'
import { PrismaClient } from '@prisma/client'
import { GET } from '@/app/api/products/[id]/route'

const prisma = new PrismaClient()

describe('GET /api/product/:id', () => {
  let productId: string

  beforeAll(async () => {
    await prisma.product.deleteMany()
    await prisma.category.deleteMany()

    const category = await prisma.category.create({ data: { name: 'Books' } })

    const product = await prisma.product.create({
      data: {
        name: 'The Great Gatsby',
        price: 15.99,
        description: 'Buen libro',
        categoryId: category.id,
      },
    })

    productId = product.id
  })

  it('should return the product by ID', async () => {
    const request = new Request(`http://localhost/api/product/${productId}`, {
      method: 'GET',
    })
    const response = await GET(request, { params: { id: productId } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('id', productId)
    expect(data.name).toBe('The Great Gatsby')
  })
})
