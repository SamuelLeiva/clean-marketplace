import { Product } from '../../entities/Product'
import { ProductRepository } from '../../ports/ProductRepository'

export class GetProductById {
  constructor(private repo: ProductRepository) {}

  async execute(id: string): Promise<Product | null> {
    return await this.repo.findById(id)
  }
}
