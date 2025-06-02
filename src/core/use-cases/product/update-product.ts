import { UpdateProductInput } from '@/contracts/product.contract'
import { Product } from '@/core/entities/Product'
import { ProductRepository } from '@/core/ports/ProductRepository'

export class UpdateProduct {
  constructor(private repo: ProductRepository) {}

  async execute(id: string, input: UpdateProductInput): Promise<Product> {
    return await this.repo.update(id, input)
  }
}
