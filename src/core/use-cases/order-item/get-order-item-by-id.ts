import { OrderItemNotFoundError } from '@/core/errors/order-item'
import { OrderItem } from '@/core/entities'
import { OrderItemRepository } from '@/core/ports'

export class GetOrderItemById {
  constructor(private repo: OrderItemRepository) {}

  async execute(id: string): Promise<OrderItem | null> {
    const orderItem = await this.repo.findById(id)
    if (!orderItem) {
      throw new OrderItemNotFoundError(id)
    }
    return orderItem
  }
}
