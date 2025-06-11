import { CannotDeleteOrderItemError, OrderItemNotFoundError } from '@/core/errors/order-item'
import { OrderItemRepository } from '@/core/ports'

export class DeleteOrderItem {
  constructor(private repo: OrderItemRepository) {}

  async execute(id: string): Promise<void> {
    const orderItem = await this.repo.findById(id)
    if (!orderItem) {
      throw new OrderItemNotFoundError(id)
    }

    // por ahora esto siempre retornará false
    const isInUse = await this.repo.isInUse(id) // Ejemplo: en un pedido, carrito...
    if (isInUse) {
      throw new CannotDeleteOrderItemError(id)
    }

    await this.repo.delete(id)
  }
}
