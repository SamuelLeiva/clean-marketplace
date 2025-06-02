import { UpdateProductInput } from '@/contracts/product.contract'
import { Product } from '@/core/entities/Product'
import { ProductNotFoundError } from '@/core/errors'
import { ProductRepository } from '@/core/ports/ProductRepository'

export class UpdateProduct {
  constructor(private repo: ProductRepository) {}

  async execute(id: string, input: UpdateProductInput): Promise<Product> {
    const product = await this.repo.findById(id)
    if (!product) {
      throw new ProductNotFoundError(id)
    }

    return await this.repo.update(id, input)
  }
}
