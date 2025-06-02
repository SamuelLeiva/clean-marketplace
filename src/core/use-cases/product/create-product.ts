import { CreateProductInput } from '@/contracts/product.contract'
import { ProductRepository } from '../../ports/ProductRepository'
import { Product } from '../../entities/Product'
import { randomUUID } from 'crypto'
import { ProductAlreadyExistsError } from '@/core/errors'

export class CreateProduct {
  constructor(private repo: ProductRepository) {}

  async execute(input: CreateProductInput): Promise<Product> {
    const existing = await this.repo.findByName(input.name)
    if(existing) {
      throw new ProductAlreadyExistsError(input.name)
    }

    const product: Product = {
      id: randomUUID(),
      ...input,
    }

    return await this.repo.create(product)
  }
}
