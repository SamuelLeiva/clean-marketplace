import { Product } from '@/core/entities/Product'
import { ProductRepository } from '@/core/ports/ProductRepository'
import { CreateProductInput, UpdateProductInput } from '@/shared/contracts/product.contract'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class PrismaProductRepository implements ProductRepository {
  async create(input: CreateProductInput): Promise<Product> {
    return await prisma.product.create({ data: input })
  }

  async findAll(): Promise<Product[]> {
    return await prisma.product.findMany()
  }

  async findById(id: string): Promise<Product | null> {
    return await prisma.product.findUnique({ where: { id } })
  }

  async update(id: string, input: UpdateProductInput): Promise<Product> {
    return await prisma.product.update({
      where: { id },
      data: input,
    })
  }

  async delete(id: string): Promise<void> {
    await prisma.product.delete({ where: { id } })
  }

  async findByName(name: string) {
    return await prisma.product.findFirst({ where: { name } })
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async isInUse(id: string) {
    return false // temporalmente
  }
}
