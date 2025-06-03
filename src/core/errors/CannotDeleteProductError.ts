import { BaseError } from '@/shared/errors/base-error'

export class CannotDeleteProductError extends BaseError {
  readonly code = 'CANNOT_DELETE_PRODUCT'
  readonly statusCode = 409
  // se podría usar este error más adelante
  constructor(productId: string) {
    super(`Cannot delete product with ID ${productId} because it is in use`)
    this.name = 'CannotDeleteProductError'
  }
}
