import { BaseError } from "@/shared/errors/base-error";

export class UnauthorizedCartAccessError extends BaseError {
  constructor(message: string = 'Unauthorized access to cart item.') {
    super(message, 403); // Usar código 403 Forbidden
  }
}