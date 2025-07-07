import { BaseError } from "@/shared/errors/base-error";

export class UnauthorizedError extends BaseError {
  constructor(message: string = 'Authentication required or invalid token.') {
    super(message, 401, 'UnauthorizedError');
  }
}