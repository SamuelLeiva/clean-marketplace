import { ProductRepository } from '@/core/ports/ProductRepository'

export class DeleteProduct {
  constructor(private repo: ProductRepository) {}

  async execute(id: string): Promise<void> {
    await this.repo.delete(id)
  }
}
