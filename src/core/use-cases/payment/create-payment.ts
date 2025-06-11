import { CreatePaymentInput } from '@/shared/contracts'
import { randomUUID } from 'crypto'
import { PaymentRepository } from '@/core/ports'
import { Payment } from '@/core/entities'

export class CreatePayment {
  constructor(private repo: PaymentRepository) {}

  async execute(input: CreatePaymentInput): Promise<Payment> {
    const Payment: Payment = {
      id: randomUUID(),
      ...input,
    }

    return await this.repo.create(Payment)
  }
}
