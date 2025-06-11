import { Order } from '@/core/entities'
import { OrderRepository } from '@/core/ports'

export class GetAllOrders {
  constructor(private repo: OrderRepository) {}

  async execute(): Promise<Order[]> {
    return await this.repo.findAll()
  }
}
