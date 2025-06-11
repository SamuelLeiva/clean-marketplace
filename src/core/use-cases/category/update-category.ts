
import { Category } from '@/core/entities/Category'
import { CategoryNotFoundError } from '@/core/errors/category'
import { CategoryRepository } from '@/core/ports/CategoryRepository'
import { UpdateCategoryInput } from '@/shared/contracts'

export class UpdateCategory {
  constructor(private repo: CategoryRepository) {}

  async execute(id: string, input: UpdateCategoryInput): Promise<Category> {
    const category = await this.repo.findById(id)
    if (!category) {
      throw new CategoryNotFoundError(id)
    }
    // TODO: Validaciones
    return await this.repo.update(id, input)
  }
}
