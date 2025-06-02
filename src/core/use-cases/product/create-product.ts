import { CreateProductInput } from '@/contracts/product.contract'
import { ProductRepository } from '../../ports/ProductRepository'
import { Product } from '../../entities/Product'
import { randomUUID } from 'crypto'

export class CreateProduct {
  constructor(private repo: ProductRepository) {}

  async execute(input: CreateProductInput): Promise<Product> {
    const product: Product = {
      id: randomUUID(),
      ...input,
    }

    return await this.repo.create(product)
  }
}
