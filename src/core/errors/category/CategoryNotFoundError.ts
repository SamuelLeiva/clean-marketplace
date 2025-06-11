import { BaseError } from '@/shared/errors/base-error'

export class CategoryNotFoundError extends BaseError {
  readonly code = 'CATEGORY_NOT_FOUND'
  readonly statusCode = 404

  constructor(categoryId: string) {
    super(`Category with ID ${categoryId} was not found`)
    this.name = 'CategoryNotFoundError'
  }
}
