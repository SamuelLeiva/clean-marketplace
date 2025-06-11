import { BaseError } from '@/shared/errors/base-error'

export class CannotDeleteCategoryError extends BaseError {
  readonly code = 'CANNOT_DELETE_CATEGORY'
  readonly statusCode = 409
  // se podría usar este error más adelante
  constructor(categoryId: string) {
    super(`Cannot delete Category with ID ${categoryId} because it is in use`)
    this.name = 'CannotDeleteCategoryError'
  }
}
