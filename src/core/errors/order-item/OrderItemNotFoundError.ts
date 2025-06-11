import { BaseError } from '@/shared/errors/base-error'

export class OrderItemNotFoundError extends BaseError {
  readonly code = 'ORDER_ITEM_NOT_FOUND'
  readonly statusCode = 404

  constructor(orderItemId: string) {
    super(`OrderItem with ID ${orderItemId} was not found`)
    this.name = 'OrderItemNotFoundError'
  }
}
