import { BaseError } from '@/shared/errors/base-error'

export class InvalidCategoryDataError extends BaseError {
  readonly code = 'INVALID_CATEGORY_DATA'
  readonly statusCode = 422

  constructor(details?: unknown) {
    super(`Invalid Category data`)
    this.name = 'InvalidCategoryDataError'
    if (details) {
      // Puedes opcionalmente guardar detalles extra si deseas
      this.stack =
        typeof details === 'string' ? details : JSON.stringify(details)
    }
  }
}
