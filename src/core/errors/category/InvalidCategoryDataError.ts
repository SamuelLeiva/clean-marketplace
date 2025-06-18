import { BaseError } from '@/shared/errors/base-error'

export class InvalidCategoryDataError extends BaseError {
  constructor(message: string = 'Invalid Category data') {
    super(
      message,
      422, // Your chosen status code for "Unprocessable Content"
      'InvalidCategoryDataError', // Your specific error code for this error type
    )
  }
}
