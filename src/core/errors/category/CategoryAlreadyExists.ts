import { BaseError } from '@/shared/errors/base-error'

export class CategoryAlreadyExistsError extends BaseError {
  readonly code = 'CATEGORY_ALREADY_EXISTS'
  readonly statusCode = 409

  constructor(categoryName: string) {
    super(`Category ${categoryName} already exists`)
    this.name = 'CategoryAlreadyExistsError'
  }
}