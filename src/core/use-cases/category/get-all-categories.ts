import { Category } from '../../entities/Category'
import { CategoryRepository } from '../../ports/CategoryRepository'

export class GetAllCategories {
  constructor(private repo: CategoryRepository) {}

  async execute(): Promise<Category[]> {
    return await this.repo.findAll()
  }
}
