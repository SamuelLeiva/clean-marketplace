import { BaseError } from "@/shared/errors/base-error";

export class InvalidCartOperationError extends BaseError {
  constructor(message: string = 'Invalid cart operation.') {
    super(message, 400, 'InvalidCartOperationError'); 
  }
}