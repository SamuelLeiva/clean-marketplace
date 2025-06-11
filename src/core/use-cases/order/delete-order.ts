import { CannotDeleteOrderError, OrderNotFoundError } from '@/core/errors/order'
import { OrderRepository } from '@/core/ports'

export class DeleteOrder {
  constructor(private repo: OrderRepository) {}

  async execute(id: string): Promise<void> {
    const order = await this.repo.findById(id)
    if (!order) {
      throw new OrderNotFoundError(id)
    }

    // por ahora esto siempre retornará false
    const isInUse = await this.repo.isInUse(id) // Ejemplo: en un pedido, carrito...
    if (isInUse) {
      throw new CannotDeleteOrderError(id)
    }

    await this.repo.delete(id)
  }
}
