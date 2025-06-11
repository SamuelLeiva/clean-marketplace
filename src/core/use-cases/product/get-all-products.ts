import { Product } from '@/core/entities'
import { ProductRepository } from '@/core/ports'

export class GetAllProducts {
  constructor(private repo: ProductRepository) {}

  async execute(): Promise<Product[]> {
    return await this.repo.findAll()
  }
}
