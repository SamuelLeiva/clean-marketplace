import { CreatePaymentInput, UpdatePaymentInput } from '@/shared/contracts'
import { Payment } from '../entities'

export interface PaymentRepository {
  create(payment: CreatePaymentInput): Promise<Payment>
  findById(id: string): Promise<Payment | null>
  findAll(): Promise<Payment[]>
  update(id: string, payment: UpdatePaymentInput): Promise<Payment>
  delete(id: string): Promise<void>

  // Métodos adicionales al CRUD clásico
  findByName(name: string): Promise<Payment | null>
  isInUse(id: string): Promise<boolean>
}
