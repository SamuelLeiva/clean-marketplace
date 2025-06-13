import { CreateOrderItemInput, UpdateOrderItemInput } from '@/shared/contracts'
import { OrderItem } from '../entities'

export interface OrderItemRepository {
  create(orderItem: CreateOrderItemInput): Promise<OrderItem>
  findById(id: string): Promise<OrderItem | null>
  findAll(): Promise<OrderItem[]>
  update(id: string, orderItem: UpdateOrderItemInput): Promise<OrderItem>
  delete(id: string): Promise<void>

  // Métodos adicionales al CRUD clásico
  findByName(name: string): Promise<OrderItem | null>
  isInUse(id: string): Promise<boolean>
}
