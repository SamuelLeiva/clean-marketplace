import { OrderItem } from '@/core/entities';
import { OrderItemRepository } from '@/core/ports'
import { CreateOrderItemInput } from '@/shared/contracts';
import { randomUUID } from 'crypto';

export class CreateOrderItem {
  constructor(private repo: OrderItemRepository) {}

  async execute(input: CreateOrderItemInput): Promise <OrderItem> {
    const orderItem: OrderItem = {
        id: randomUUID(),
        ...input
    }

    return await this.repo.create(orderItem)
  }
}
