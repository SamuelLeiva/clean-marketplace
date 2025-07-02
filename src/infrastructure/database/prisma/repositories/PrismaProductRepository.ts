import { Product } from '@/core/entities/Product'
import { ProductRepository } from '@/core/ports/ProductRepository'
import {
  CreateProductInput,
  GetProductsFilterInput,
  PaginatedProductListResponse,
  UpdateProductInput,
} from '@/shared/contracts/product.contract'
import { PrismaClient, Prisma } from '@prisma/client'
import { normalizeProduct } from '../mappers/normalizeProduct'

export class PrismaProductRepository implements ProductRepository {
  private prisma: PrismaClient

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient || new PrismaClient()
  }

  async create(input: CreateProductInput): Promise<Product> {
    const result = await this.prisma.product.create({
      data: input,
    })
    return normalizeProduct(result)
  }

  async findAllPaginated(
    filters: GetProductsFilterInput,
  ): Promise<PaginatedProductListResponse> {
    const {
      page,
      limit,
      name,
      minStock,
      maxStock,
      minPrice,
      maxPrice,
      categoryId,
    } = filters
    const skip = (page - 1) * limit

    // Build the Prisma 'where' clause dynamically based on filters
    // We will build this object by adding conditions as needed
    const where: Prisma.ProductWhereInput = {}

    // Filter by name
    if (name) {
      where.name = {
        contains: name,
        mode: 'insensitive',
      }
    }

    // Filter by stock range
    if (minStock !== undefined || maxStock !== undefined) {
      // Ensure 'stock' is initialized as an object before adding properties
      where.stock = {} // Initialize as empty object if any stock filter is present
      if (minStock !== undefined) {
        where.stock.gte = minStock
      }
      if (maxStock !== undefined) {
        where.stock.lte = maxStock
      }
    }

    // Filter by price range
    if (minPrice !== undefined || maxPrice !== undefined) {
      // Ensure 'price' is initialized as an object before adding properties
      where.price = {} // Initialize as empty object if any price filter is present
      if (minPrice !== undefined) {
        where.price.gte = minPrice
      }
      if (maxPrice !== undefined) {
        where.price.lte = maxPrice
      }
    }

    // Filter by category ID
    if (categoryId) {
      where.categoryId = categoryId
    }

    const [productsRaw, totalItems] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        skip: skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ])

    const products = productsRaw.map(normalizeProduct)
    const totalPages = Math.ceil(totalItems / limit)

    return {
      data: products,
      meta: {
        totalItems,
        totalPages,
        currentPage: page,
        itemsPerPage: limit,
      },
    }
  }

  // async findAll(): Promise<Product[]> {
  //   const results = await this.prisma.product.findMany()
  //   return results.map(normalizeProduct)
  // }

  async findById(id: string): Promise<Product | null> {
    const result = await this.prisma.product.findUnique({ where: { id } })
    return result ? normalizeProduct(result) : null
  }

  async update(id: string, input: UpdateProductInput): Promise<Product> {
    const result = await this.prisma.product.update({
      where: { id },
      data: input,
    })
    return normalizeProduct(result)
  }

  async delete(id: string): Promise<void> {
    await this.prisma.product.delete({ where: { id } })
  }

  async findByName(name: string): Promise<Product | null> {
    const result = await this.prisma.product.findFirst({ where: { name } })
    return result ? normalizeProduct(result) : null
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async isInUse(id: string) {
    return false // temporalmente
  }
}
