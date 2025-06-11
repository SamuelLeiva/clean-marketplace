import { Category } from '@/core/entities/Category'
import { CategoryRepository } from '@/core/ports'

export class GetAllCategories {
  constructor(private repo: CategoryRepository) {}

  async execute(): Promise<Category[]> {
    return await this.repo.findAll()
  }
}
