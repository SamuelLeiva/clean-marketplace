
import { Payment } from '@/core/entities'
import { PaymentNotFoundError } from '@/core/errors/payment'
import { PaymentRepository } from '@/core/ports'
import { UpdatePaymentInput } from '@/shared/contracts'

export class UpdatePayment {
  constructor(private repo: PaymentRepository) {}

  async execute(id: string, input: UpdatePaymentInput): Promise<Payment> {
    const Payment = await this.repo.findById(id)
    if (!Payment) {
      throw new PaymentNotFoundError(id)
    }

    //TODO: añadir validaciones en todos los use cases por si son llamados por tests u otros entornos

    return await this.repo.update(id, input)
  }
}
