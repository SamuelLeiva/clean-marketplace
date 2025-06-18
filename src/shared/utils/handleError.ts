// src/shared/utils/handleError.ts

import { NextResponse } from 'next/server' // Your custom base error
import { ZodError } from 'zod' // Import ZodError
import { BaseError } from '../errors/base-error'

/**
 * Maps various error types to a Next.js NextResponse for API responses.
 * This is the final error handler for the API routes.
 */
export function handleError(error: unknown): NextResponse {
  // 1. Handle Zod Validation Errors (highest priority for client feedback)
  if (error instanceof ZodError) {
    const errors = error.errors.map((err) => ({
      path: err.path.join('.'),
      message: err.message,
      code: err.code, // Zod's specific error code
    }))
    return NextResponse.json(
      {
        success: false,
        message: 'Validation failed due to invalid input.',
        errors: errors,
      },
      { status: 400 },
    )
  }

  // 2. Handle Custom BaseError instances (your domain-specific and mapped Prisma errors)
  if (error instanceof BaseError) {
    return NextResponse.json(
      { success: false, message: error.message, code: error.name }, // Use error.name as a custom code
      { status: error.statusCode },
    )
  }

  // 3. Handle Generic Errors (fallback for unexpected errors)
  if (error instanceof Error) {
    console.error('Unhandled error:', error) // Log unexpected errors for server-side debugging
    return NextResponse.json(
      {
        success: false,
        message: 'An unexpected internal server error occurred.',
        error: error.message,
        code: 'INTERNAL_SERVER_ERROR',
      },
      { status: 500 },
    )
  }

  // Fallback for truly unknown error types
  console.error('An entirely unknown error type was thrown:', error)
  return NextResponse.json(
    {
      success: false,
      message: 'An unknown error occurred.',
      code: 'UNKNOWN_ERROR',
    },
    { status: 500 },
  )
}
