import { BaseError } from '@/shared/errors/base-error'

export class PaymentNotFoundError extends BaseError {
  readonly code = 'PAYMENT_NOT_FOUND'
  readonly statusCode = 404

  constructor(paymentId: string) {
    super(`Paymentt with ID ${paymentId} was not found`)
    this.name = 'PaymenttNotFoundError'
  }
}
