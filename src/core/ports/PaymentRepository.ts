import { Payment } from '../entities'

export interface PaymentRepository {
  create(payment: Payment): Promise<Payment>
  findById(id: string): Promise<Payment | null>
  findAll(): Promise<Payment[]>
  update(id: string, Payment: Partial<Payment>): Promise<Payment>
  delete(id: string): Promise<void>

}
