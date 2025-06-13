import { Product } from '@/core/entities'
import { ProductNotFoundError } from '@/core/errors/product'
import { ProductRepository } from '@/core/ports'
import { UpdateProductInput } from '@/shared/contracts'

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
