import { Order } from '../entities'

export interface OrderRepository {
  create(order: Order): Promise<Order>
  findById(id: string): Promise<Order | null>
  findAll(): Promise<Order[]>
  update(id: string, Order: Partial<Order>): Promise<Order>
  delete(id: string): Promise<void>
}
