import { Category } from '@/core/entities'
import { CategoryAlreadyExistsError } from '@/core/errors/category'
import { CategoryRepository } from '@/core/ports'
import { CreateCategoryInput } from '@/shared/contracts'

export class CreateCategory {
  constructor(private repo: CategoryRepository) {}

  async execute(input: CreateCategoryInput): Promise<Category> {
    const existing = await this.repo.findByName(input.name)
    if (existing) {
      throw new CategoryAlreadyExistsError(input.name)
    }
    return await this.repo.create(input)
  }
}
