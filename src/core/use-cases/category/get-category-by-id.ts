
import { CategoryNotFoundError } from '@/core/errors/category'
import { Category } from '@/core/entities'
import { CategoryRepository } from '@/core/ports'

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
