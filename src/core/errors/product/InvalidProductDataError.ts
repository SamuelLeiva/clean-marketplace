import { BaseError } from '@/shared/errors/base-error'

// export class InvalidProductDataError extends BaseError {
//   readonly code = 'INVALID_PRODUCT_DATA'
//   readonly statusCode = 422

//   constructor(details?: unknown) {
//     super(`Invalid product data`)
//     this.name = 'InvalidProductDataError'
//     if (details) {
//       // Puedes opcionalmente guardar detalles extra si deseas
//       this.stack =
//         typeof details === 'string' ? details : JSON.stringify(details)
//     }
//   }
// }
export class InvalidProductDataError extends BaseError {
  constructor(message: string = 'Invalid Product data') {
    super(
      message,
      422, // Your chosen status code for "Unprocessable Content"
      'InvalidProductDataError', // Your specific error code for this error type
    )
  }
}
