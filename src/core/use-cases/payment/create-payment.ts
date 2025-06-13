import { CreatePaymentInput } from '@/shared/contracts'
import { PaymentRepository } from '@/core/ports'
import { Payment } from '@/core/entities'

export class CreatePayment {
  constructor(private repo: PaymentRepository) {}

  async execute(input: CreatePaymentInput): Promise<Payment> {
    return await this.repo.create(input)
  }
}
