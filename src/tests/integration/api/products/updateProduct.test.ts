import { describe, it, expect, beforeAll } from 'vitest'
import { PrismaClient } from '@prisma/client'
import { PUT } from '@/app/api/products/[id]/route'

const prisma = new PrismaClient()

describe('PUT /api/product/:id', () => {
  let productId: string

  beforeAll(async () => {
    await prisma.product.deleteMany()
    await prisma.category.deleteMany()

    const category = await prisma.category.create({ data: { name: 'Clothes' } })

    const product = await prisma.product.create({
      data: {
        name: 'T-Shirt',
        price: 19.99,
        description: "Buen polo",
        categoryId: category.id,
      },
    })

    productId = product.id
  })

  it('should update the product', async () => {
    const request = new Request(`http://localhost/api/product/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ price: 25.99 }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await PUT(request, { params: { id: productId } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('id', productId)
    expect(data.price).toBe(25.99)
  })
})
