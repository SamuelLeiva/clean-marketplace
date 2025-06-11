import { BaseError } from '@/shared/errors/base-error'

export class CannotDeleteUserError extends BaseError {
  readonly code = 'CANNOT_DELETE_USER'
  readonly statusCode = 409
  // se podría usar este error más adelante
  constructor(userId: string) {
    super(`Cannot delete user with ID ${userId} because it is in use`)
    this.name = 'CannotDeleteUserError'
  }
}
