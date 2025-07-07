import { BaseError } from "@/shared/errors/base-error";

export class InvalidCredentialsError extends BaseError {
  constructor(message: string = 'Invalid email or password.') {
    super(message, 401, 'InvalidCredentialsError'); // 401 Unauthorized
  }
}