import { CannotDeletePaymentError, PaymentNotFoundError } from '@/core/errors/payment'
import { PaymentRepository } from '@/core/ports'

export class DeletePayment {
  constructor(private repo: PaymentRepository) {}

  async execute(id: string): Promise<void> {
    const payment = await this.repo.findById(id)
    if (!payment) {
      throw new PaymentNotFoundError(id)
    }

    // por ahora esto siempre retornará false
    const isInUse = await this.repo.isInUse(id) // Ejemplo: en un pedido, carrito...
    if (isInUse) {
      throw new CannotDeletePaymentError(id)
    }

    await this.repo.delete(id)
  }
}
