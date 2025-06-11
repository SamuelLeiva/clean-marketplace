import { Payment } from '@/core/entities'
import { PaymentRepository } from '@/core/ports'

export class GetAllPayments {
  constructor(private repo: PaymentRepository) {}

  async execute(): Promise<Payment[]> {
    return await this.repo.findAll()
  }
}
