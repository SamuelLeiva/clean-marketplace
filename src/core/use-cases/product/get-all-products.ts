import { Product } from '../../entities/Product'
import { ProductRepository } from '../../ports/ProductRepository'

export class GetAllProducts {
  constructor(private repo: ProductRepository) {}

  async execute(): Promise<Product[]> {
    return await this.repo.findAll()
  }
}
