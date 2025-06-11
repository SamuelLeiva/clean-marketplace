
import { Product } from '@/core/entities/Product'
import { InvalidProductDataError, ProductNotFoundError } from '@/core/errors/product'
import { ProductRepository } from '@/core/ports/ProductRepository'
import { UpdateProductInput } from '@/shared/contracts'

export class UpdateProduct {
  constructor(private repo: ProductRepository) {}

  async execute(id: string, input: UpdateProductInput): Promise<Product> {
    const product = await this.repo.findById(id)
    if (!product) {
      throw new ProductNotFoundError(id)
    }

    //TODO: añadir validaciones en todos los use cases por si son llamados por tests u otros entornos

    if (input.price !== undefined && input.price < 0) {
      throw new InvalidProductDataError('Price cannot be negative')
    }

    return await this.repo.update(id, input)
  }
}
