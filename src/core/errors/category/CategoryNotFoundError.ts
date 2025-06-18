import { BaseError } from '@/shared/errors/base-error'

export class CategoryNotFoundError extends BaseError {
  constructor(id: string) {
    super(`Category with ID ${id} not found`, 404, 'CategoryNotFoundError')
  }
}
