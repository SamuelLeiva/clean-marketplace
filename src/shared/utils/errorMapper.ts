// src/shared/utils/errorMapper.ts

import {
  ProductNotFoundError,
  ProductAlreadyExistsError,
  InvalidProductDataError,
  CannotDeleteProductError,
} from '@/core/errors/product'; // Adjust path for all your product errors

// Import other domain errors as you create them
import { CategoryNotFoundError, CategoryAlreadyExistsError, CannotDeleteCategoryError } from '@/core/errors/category'; // Assuming you have these now

type ErrorStatusPair = [new (...args: unknown[]) => Error, number];

export const errorStatusMap: Map<new (...args: unknown[]) => Error, number> = new Map([
  // Product Errors
  [ProductNotFoundError, 404],              // Not Found
  [ProductAlreadyExistsError, 409],         // Conflict
  [InvalidProductDataError, 422],           // Unprocessable Entity (for semantic/business logic validation)
  [CannotDeleteProductError, 400],          // Bad Request (often, 409 Conflict could also apply here)

  // Category Errors
  [CategoryNotFoundError, 404],             // Not Found
  [CategoryAlreadyExistsError, 409],        // Conflict
  [CannotDeleteCategoryError, 400],         // Bad Request
] as ErrorStatusPair[]
);

// A default status for generic unexpected errors
export const DEFAULT_ERROR_STATUS = 500; // Internal Server Error