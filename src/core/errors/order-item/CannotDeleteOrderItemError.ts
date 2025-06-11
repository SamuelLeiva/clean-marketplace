import { BaseError } from '@/shared/errors/base-error'

export class CannotDeleteOrderItemError extends BaseError {
  readonly code = 'CANNOT_DELETE_ORDER_ITEM'
  readonly statusCode = 409
  // se podría usar este error más adelante
  constructor(orderItemId: string) {
    super(`Cannot delete orderItem with ID ${orderItemId} because it is in use`)
    this.name = 'CannotDeleteOrderItemError'
  }
}
