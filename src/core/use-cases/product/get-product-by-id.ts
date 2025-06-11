import { ProductNotFoundError } from '@/core/errors/product'
import { Product } from '@/core/entities'
import { ProductRepository } from '@/core/ports'

export class GetProductById {
  constructor(private repo: ProductRepository) {}

  async execute(id: string): Promise<Product | null> {
    const product = await this.repo.findById(id)
    if (!product) {
      throw new ProductNotFoundError(id)
    }
    return product
  }
}
