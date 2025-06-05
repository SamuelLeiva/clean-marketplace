import { GET } from "@/app/api/products/route";
import { PrismaClient } from "@prisma/client";
import { beforeAll, describe, expect, it } from "vitest";

const prisma = new PrismaClient()

describe('GET /api/product', () => {
  beforeAll(async () => {
    await prisma.product.deleteMany()
    await prisma.category.deleteMany()

    const category = await prisma.category.create({
      data: { name: 'Electronics' },
    })

    await prisma.product.createMany({
      data: [
        { name: 'Phone', description: 'Teléfono', price: 299.99, categoryId: category.id },
        { name: 'Laptop', description: 'Laptop genial', price: 999.99, categoryId: category.id },
      ],
    })
  })

  it('should return all products', async () => {
    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBe(2)
    expect(data[0]).toHaveProperty('id')
    expect(data[0]).toHaveProperty('name')
  })
})