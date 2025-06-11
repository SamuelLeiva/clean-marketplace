import { CreateProductInput } from '@/shared/contracts'
import { randomUUID } from 'crypto'
import { ProductAlreadyExistsError } from '@/core/errors/product'
import { ProductRepository } from '@/core/ports'
import { Product } from '@/core/entities'

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
