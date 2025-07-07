import { BaseError } from '@/shared/errors/base-error'

export class UserAlreadyExistsError extends BaseError {
  constructor(
    message: string = 'User with this email already exists.'
  ) {
    super(message, 409, 'UserAlreadyExistsError');
  }
}
