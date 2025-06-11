import { Order } from '@/core/entities';
import { OrderRepository } from '@/core/ports'
import { CreateOrderInput } from '@/shared/contracts';
import { randomUUID } from 'crypto';

export class CreateOrder {
  constructor(private repo: OrderRepository) {}

  async execute(input: CreateOrderInput): Promise <Order> {
    const Order: Order = {
        id: randomUUID(),
        ...input
    }

    return await this.repo.create(Order)
  }
}
