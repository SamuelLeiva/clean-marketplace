import { BaseError } from '@/shared/errors/base-error'

// export class ProductNotFoundError extends BaseError {
//   readonly code = 'PRODUCT_NOT_FOUND'
//   readonly statusCode = 404

//   constructor(productId: string) {
//     super(`Product with ID ${productId} was not found`)
//     this.name = 'ProductNotFoundError'
//   }
// }


export class ProductNotFoundError extends BaseError {
  constructor(id: string) {
    super(`Product with ID ${id} not found`, 404, 'ProductNotFoundError')
  }
}
