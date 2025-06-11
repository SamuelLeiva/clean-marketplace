
import { CategoryNotFoundError } from '@/core/errors/category'
import { Category } from '../../entities/Category'
import { CategoryRepository } from '../../ports/CategoryRepository'

export class GetCategoryById {
  constructor(private repo: CategoryRepository) {}

  async execute(id: string): Promise<Category | null> {
    const category = await this.repo.findById(id)
    if (!category) {
      throw new CategoryNotFoundError(id)
    }
    return category
  }
}
