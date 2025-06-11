import { OrderNotFoundError } from '@/core/errors/order'
import { Order } from '@/core/entities'
import { OrderRepository } from '@/core/ports'

export class GetOrderById {
  constructor(private repo: OrderRepository) {}

  async execute(id: string): Promise<Order | null> {
    const order = await this.repo.findById(id)
    if (!order) {
      throw new OrderNotFoundError(id)
    }
    return order
  }
}
