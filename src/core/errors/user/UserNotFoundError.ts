import { BaseError } from "@/shared/errors/base-error"

export class UserNotFoundError extends BaseError {
  readonly code = 'USER_NOT_FOUND'
  readonly statusCode = 404

  constructor(userId: string) {
    super(`User with ID ${userId} was not found`)
    this.name = 'UserNotFoundError'
  }
}