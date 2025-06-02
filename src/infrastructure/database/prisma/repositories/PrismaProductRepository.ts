import { Product } from "@/core/entities/Product";
import { ProductRepository } from "@/core/ports/ProductRepository";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class PrismaProductRepository implements ProductRepository {
  async create(product: Product): Promise<Product> {
    return await prisma.product.create({ data: product })
  }

  async findAll(): Promise<Product[]> {
    return await prisma.product.findMany()
  }

  async findById(id: string): Promise<Product | null> {
    return await prisma.product.findUnique({ where: { id } })
  }

  async update(id: string, product: Partial<Product>): Promise<Product> {
    return await prisma.product.update({
      where: { id },
      data: product,
    })
  }

  async delete(id: string): Promise<void> {
    await prisma.product.delete({ where: { id } })
  }
}