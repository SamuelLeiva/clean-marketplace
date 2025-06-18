import { BaseError } from '@/shared/errors/base-error'

export class CategoryAlreadyExistsError extends BaseError {
  constructor(name: string) {
    super(
      `Category with name '${name}' already exists`,
      409,
      'CategoryAlreadyExistsError',
    )
  }
}
