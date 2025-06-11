import { BaseError } from '@/shared/errors/base-error'

export class CannotDeletePaymentError extends BaseError {
  readonly code = 'CANNOT_DELETE_PAYMENT'
  readonly statusCode = 409
  // se podría usar este error más adelante
  constructor(paymentId: string) {
    super(`Cannot delete payment with ID ${paymentId} because it is in use`)
    this.name = 'CannotDeletePaymentError'
  }
}
