import { BaseError } from "@/shared/errors/base-error";

export class CartItemNotFoundError extends BaseError {
  constructor(id: string) {
    super(`Cart item with ID ${id} not found`, 404, 'CartItemNotFoundError')
  }
}