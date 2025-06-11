import { ProductNotFoundError } from '@/core/errors/product/ProductNotFoundError'
import { Product } from '../../entities/Product'
import { ProductRepository } from '../../ports/ProductRepository'

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
