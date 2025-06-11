import { BaseError } from '@/shared/errors/base-error'

export class UserAlreadyExistsError extends BaseError {
  readonly code = 'USER_ALREADY_EXISTS'
  readonly statusCode = 409

  constructor(userName: string) {
    super(`User ${userName} already exists`)
    this.name = 'UserAlreadyExistsError'
  }
}