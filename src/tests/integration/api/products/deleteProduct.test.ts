// tests/integration/api/product/delete-product.test.ts
import { describe, it, expect, beforeAll } from 'vitest'
import { PrismaClient } from '@prisma/client'
import { DELETE } from '@/app/api/products/[id]/route'

const prisma = new PrismaClient()

describe('DELETE /api/product/:id', () => {
  let productId: string

  beforeAll(async () => {
    await prisma.product.deleteMany()
    await prisma.category.deleteMany()

    const category = await prisma.category.create({
      data: { name: 'Furniture' },
    })

    const product = await prisma.product.create({
      data: {
        name: 'Chair',
        price: 49.99,
        description: 'Buena silla',
        categoryId: category.id,
      },
    })

    productId = product.id
  })

  it('should delete the product', async () => {
    const request = new Request(`http://localhost/api/product/${productId}`, {
      method: 'DELETE',
    })
    const response = await DELETE(request, { params: { id: productId } })

    expect(response.status).toBe(204)

    const deleted = await prisma.product.findUnique({
      where: { id: productId },
    })
    expect(deleted).toBeNull()
  })
})
