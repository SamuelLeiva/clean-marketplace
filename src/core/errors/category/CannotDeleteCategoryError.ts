import { BaseError } from "@/shared/errors/base-error";

export class CannotDeleteCategoryError extends BaseError {
  constructor(id: string) {
    super(`Category with ID ${id} cannot be deleted as it has existing dependencies.`, 400, 'CannotDeleteCategoryError'); // Using 400 for a business rule violation
    // You could also argue for 409 Conflict here, depending on your API philosophy.
  }
}