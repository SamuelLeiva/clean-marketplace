import { PaymentNotFoundError } from '@/core/errors/payment'
import { Payment } from '../../entities/Payment'
import { PaymentRepository } from '@/core/ports'

export class GetPaymentById {
  constructor(private repo: PaymentRepository) {}

  async execute(id: string): Promise<Payment | null> {
    const payment = await this.repo.findById(id)
    if (!payment) {
      throw new PaymentNotFoundError(id)
    }
    return payment
  }
}
