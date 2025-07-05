import { BaseError } from "@/shared/errors/base-error";

export class CartNotFoundError extends BaseError {
  constructor(id: string) {
    super(`Cart with ID ${id} not found`, 404, 'CartNotFoundError')
  }
}
