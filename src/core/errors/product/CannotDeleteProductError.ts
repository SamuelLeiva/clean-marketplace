import { BaseError } from '@/shared/errors/base-error'

export class CannotDeleteProductError extends BaseError {
  constructor(id: string) {
    super(
      `Product with ID ${id} cannot be deleted as it has existing dependencies.`,
      400,
      'CannotDeleteProductError',
    ) // Using 400 for a business rule violation
    // You could also argue for 409 Conflict here, depending on your API philosophy.
  }
}
