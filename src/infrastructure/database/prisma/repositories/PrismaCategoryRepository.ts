import { Category } from '@/core/entities'
import { CategoryRepository } from '@/core/ports'
import { CreateCategoryInput, UpdateCategoryInput } from '@/shared/contracts'
import { Prisma, PrismaClient } from '@prisma/client'
import { normalizeCategory } from '../mappers/normalizeCategory'
import {
  CannotDeleteCategoryError,
  CategoryAlreadyExistsError,
  CategoryNotFoundError,
} from '@/core/errors/category'

//const prisma = new PrismaClient()

export class PrismaCategoryRepository implements CategoryRepository {
  private prisma: PrismaClient

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient || new PrismaClient()
  }

  // --- Utility to map Prisma errors to domain errors ---
  private handleRepoError(error: unknown, id?: string, name?: string): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2025': // Record not found (e.g., for findUnique, update, delete where id doesn't exist)
          throw new CategoryNotFoundError(id || 'unknown ID') // Use provided ID
        case 'P2002': // Unique constraint failed (e.g., on 'name' during create/update)
          const targetField = (error.meta as { target?: string[] })?.target
          if (targetField && targetField.includes('name')) {
            throw new CategoryAlreadyExistsError(name || 'unknown name') // Use provided name
          }
          break // Fall through if not 'name' field
        case 'P2003': // Foreign key constraint failed (e.g., deleting a category with products)
          throw new CannotDeleteCategoryError(id || 'unknown ID') // Use provided ID
        // Add more Prisma error codes if you want to map them to specific domain errors
        case 'P2000': // Value too long for column
          throw new Error('Input value too long for a database field.') // Or a specific InvalidCategoryDataError
        // ... other Prisma errors
      }
    }
    // If it's not a Prisma error we specifically handle, re-throw the original error
    // This could be another type of Error or an unexpected runtime issue
    throw error
  }

  async create(input: CreateCategoryInput): Promise<Category> {
    try {
      const result = await this.prisma.category.create({
        data: input,
      })
      return normalizeCategory(result)
    } catch (error) {
      this.handleRepoError(error, undefined, input.name)
    }
  }

  async findAll(): Promise<Category[]> {
    try {
      const results = await this.prisma.category.findMany()
      return results.map(normalizeCategory)
    } catch (error) {
      this.handleRepoError(error)
    }
  }

  async findById(id: string): Promise<Category | null> {
    try {
      const result = await this.prisma.category.findUnique({ where: { id } })
      return result ? normalizeCategory(result) : null
    } catch (error) {
      this.handleRepoError(error, id)
    }
  }

  async update(id: string, input: UpdateCategoryInput): Promise<Category> {
    try {
      const result = await this.prisma.category.update({
        where: { id },
        data: input,
      })
      return normalizeCategory(result)
    } catch (error) {
      this.handleRepoError(error, id, input.name)
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.category.delete({ where: { id } })
    } catch (error) {
      this.handleRepoError(error, id)
    }
  }

  async findByName(name: string): Promise<Category | null> {
    try {
      const result = await this.prisma.category.findFirst({ where: { name } })
      return result ? normalizeCategory(result) : null
    } catch (error) {
      this.handleRepoError(error, name)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async isInUse(id: string) {
    return false // temporalmente
  }
}
