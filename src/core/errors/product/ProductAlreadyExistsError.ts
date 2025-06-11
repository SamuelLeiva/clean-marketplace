import { BaseError } from '@/shared/errors/base-error'

export class ProductAlreadyExistsError extends BaseError {
  readonly code = 'PRODUCT_ALREADY_EXISTS'
  readonly statusCode = 409

  constructor(productName: string) {
    super(`Product ${productName} already exists`)
    this.name = 'ProductAlreadyExistsError'
  }
}
