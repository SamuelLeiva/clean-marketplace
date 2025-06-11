import { OrderItem } from '@/core/entities'
import { OrderItemNotFoundError } from '@/core/errors/order-item'
import { OrderItemRepository } from '@/core/ports'
import { UpdateOrderItemInput } from '@/shared/contracts'

export class UpdateOrderItem {
  constructor(private repo: OrderItemRepository) {}

  async execute(id: string, input: UpdateOrderItemInput): Promise<OrderItem> {
    const orderItem = await this.repo.findById(id)
    if (!orderItem) {
      throw new OrderItemNotFoundError(id)
    }
    // TODO: Validaciones
    return await this.repo.update(id, input)
  }
}
