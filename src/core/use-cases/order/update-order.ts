import { Order } from '@/core/entities'
import { OrderNotFoundError } from '@/core/errors/order'
import { OrderRepository } from '@/core/ports'
import { UpdateOrderInput } from '@/shared/contracts'

export class UpdateOrder {
  constructor(private repo: OrderRepository) {}

  async execute(id: string, input: UpdateOrderInput): Promise<Order> {
    const order = await this.repo.findById(id)
    if (!order) {
      throw new OrderNotFoundError(id)
    }
    // TODO: Validaciones
    return await this.repo.update(id, input)
  }
}
