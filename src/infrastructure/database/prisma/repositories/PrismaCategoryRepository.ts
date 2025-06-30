import { Category } from '@/core/entities'
import { CategoryRepository } from '@/core/ports'
import {
  CreateCategoryInput,
  PaginatedCategoryListResponse,
  UpdateCategoryInput,
} from '@/shared/contracts'
import { PrismaClient } from '@prisma/client'
import { normalizeCategory } from '../mappers/normalizeCategory'
import { PaginationOptions } from '@/shared/constants/pagination'

//const prisma = new PrismaClient()

export class PrismaCategoryRepository implements CategoryRepository {
  private prisma: PrismaClient

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient || new PrismaClient()
  }

  async create(input: CreateCategoryInput): Promise<Category> {
    const result = await this.prisma.category.create({
      data: input,
    })
    return normalizeCategory(result)
  }

  async findAllPaginated(
    options: PaginationOptions,
  ): Promise<PaginatedCategoryListResponse> {
    const { page, limit } = options
    const skip = (page - 1) * limit // Calculate how many records to skip
    // Use Prisma's findMany with skip and take for pagination
    const categories = await this.prisma.category.findMany({
      skip: skip,
      take: limit,
      // You can add orderBy or where clauses here if needed
      // orderBy: { name: 'asc' },
    })

    // Get the total count of categories for pagination metadata
    const totalItems = await this.prisma.category.count()
    const totalPages = Math.ceil(totalItems / limit)

    return {
      data: categories,
      meta: {
        totalItems,
        totalPages,
        currentPage: page,
        itemsPerPage: limit,
      },
    }
  }

  // async findAll(): Promise<Category[]> {
  //   const results = await this.prisma.category.findMany()
  //   return results.map(normalizeCategory)
  // }

  async findById(id: string): Promise<Category | null> {
    const result = await this.prisma.category.findUnique({ where: { id } })
    return result ? normalizeCategory(result) : null
  }

  async update(id: string, input: UpdateCategoryInput): Promise<Category> {
    const result = await this.prisma.category.update({
      where: { id },
      data: input,
    })
    return normalizeCategory(result)
  }

  async delete(id: string): Promise<void> {
    await this.prisma.category.delete({ where: { id } })
  }

  async findByName(name: string): Promise<Category | null> {
    const result = await this.prisma.category.findFirst({ where: { name } })
    return result ? normalizeCategory(result) : null
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async isInUse(id: string) {
    return false // temporalmente
  }
}
