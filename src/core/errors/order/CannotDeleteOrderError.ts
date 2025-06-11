import { BaseError } from '@/shared/errors/base-error'

export class CannotDeleteOrderError extends BaseError {
  readonly code = 'CANNOT_DELETE_ORDER'
  readonly statusCode = 409
  // se podría usar este error más adelante
  constructor(orderId: string) {
    super(`Cannot delete order with ID ${orderId} because it is in use`)
    this.name = 'CannotDeleteOrderError'
  }
}
