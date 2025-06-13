import { CreateOrderInput, UpdateOrderInput } from '@/shared/contracts'
import { Order } from '../entities'

export interface OrderRepository {
  create(order: CreateOrderInput): Promise<Order>
  findById(id: string): Promise<Order | null>
  findAll(): Promise<Order[]>
  update(id: string, order: UpdateOrderInput): Promise<Order>
  delete(id: string): Promise<void>

  // Métodos adicionales al CRUD clásico
  findByName(name: string): Promise<Order | null>
  isInUse(id: string): Promise<boolean>
}
