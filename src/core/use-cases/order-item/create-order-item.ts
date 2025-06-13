import { OrderItem } from '@/core/entities';
import { OrderItemRepository } from '@/core/ports'
import { CreateOrderItemInput } from '@/shared/contracts';

export class CreateOrderItem {
  constructor(private repo: OrderItemRepository) {}

  async execute(input: CreateOrderItemInput): Promise <OrderItem> {
    return await this.repo.create(input)
  }
}
