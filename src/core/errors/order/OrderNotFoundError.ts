import { BaseError } from '@/shared/errors/base-error'

export class OrderNotFoundError extends BaseError {
  readonly code = 'ORDER_NOT_FOUND'
  readonly statusCode = 404

  constructor(orderId: string) {
    super(`Order with ID ${orderId} was not found`)
    this.name = 'OrderNotFoundError'
  }
}
