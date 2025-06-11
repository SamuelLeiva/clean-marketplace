import { OrderItem } from '@/core/entities'
import { OrderItemRepository } from '@/core/ports'

export class GetAllOrderItems {
  constructor(private repo: OrderItemRepository) {}

  async execute(): Promise<OrderItem[]> {
    return await this.repo.findAll()
  }
}
