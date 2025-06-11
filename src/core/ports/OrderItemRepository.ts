import { OrderItem } from '../entities'

export interface OrderItemRepository {
  create(orderItem: OrderItem): Promise<OrderItem>
  findById(id: string): Promise<OrderItem | null>
  findAll(): Promise<OrderItem[]>
  update(id: string, OrderItem: Partial<OrderItem>): Promise<OrderItem>
  delete(id: string): Promise<void>

}
