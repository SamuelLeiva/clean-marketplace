import { Product } from '@/core/entities/Product'
import { ProductRepository } from '@/core/ports/ProductRepository'
import {
  CreateProductInput,
  UpdateProductInput,
} from '@/shared/contracts/product.contract'
import { PrismaClient } from '@prisma/client'
import { normalizeProduct } from '../mappers/normalizeProduct'

const prisma = new PrismaClient()

export class PrismaProductRepository implements ProductRepository {
  async create(input: CreateProductInput): Promise<Product> {
    const result = await prisma.product.create({
      data: input,
    })
    return normalizeProduct(result)
  }

  async findAll(): Promise<Product[]> {
    const results = await prisma.product.findMany()
    return results.map(normalizeProduct)
  }

  async findById(id: string): Promise<Product | null> {
    const result = await prisma.product.findUnique({ where: { id } })
    return result ? normalizeProduct(result) : null
  }

  async update(id: string, input: UpdateProductInput): Promise<Product> {
    const result = await prisma.product.update({
      where: { id },
      data: input,
    })
    return normalizeProduct(result)
  }

  async delete(id: string): Promise<void> {
    await prisma.product.delete({ where: { id } })
  }

  async findByName(name: string) : Promise<Product | null> {
    const result = await prisma.product.findFirst({ where: { name } })
    return result ? normalizeProduct(result) : null
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async isInUse(id: string) {
    return false // temporalmente
  }
}
