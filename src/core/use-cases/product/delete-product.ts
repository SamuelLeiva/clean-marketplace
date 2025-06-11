import { CannotDeleteProductError, ProductNotFoundError } from '@/core/errors/product'
import { ProductRepository } from '@/core/ports/ProductRepository'

export class DeleteProduct {
  constructor(private repo: ProductRepository) {}

  async execute(id: string): Promise<void> {
    const product = await this.repo.findById(id)
    if (!product) {
      throw new ProductNotFoundError(id)
    }

    // por ahora esto siempre retornará false
    const isInUse = await this.repo.isInUse(id) // Ejemplo: en un pedido, carrito...
    if (isInUse) {
      throw new CannotDeleteProductError(id)
    }

    await this.repo.delete(id)
  }
}
