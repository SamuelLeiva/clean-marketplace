import { Order } from '@/core/entities';
import { OrderRepository } from '@/core/ports'
import { CreateOrderInput } from '@/shared/contracts';

export class CreateOrder {
  constructor(private repo: OrderRepository) {}

  async execute(input: CreateOrderInput): Promise <Order> {
    return await this.repo.create(input)
  }
}
