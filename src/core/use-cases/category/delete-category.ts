import { CannotDeleteCategoryError, CategoryNotFoundError } from '@/core/errors/category'
import { CategoryRepository } from '@/core/ports'

export class DeleteCategory {
  constructor(private repo: CategoryRepository) {}

  async execute(id: string): Promise<void> {
    const category = await this.repo.findById(id)
    if (!category) {
      throw new CategoryNotFoundError(id)
    }

    // por ahora esto siempre retornará false
    const isInUse = await this.repo.isInUse(id) // Ejemplo: en un pedido, carrito...
    if (isInUse) {
      throw new CannotDeleteCategoryError(id)
    }

    await this.repo.delete(id)
  }
}
