import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export function handleZodError(error: unknown) {
  if (error instanceof ZodError) {
    // Transforms ZodError into a more readable format
    const errors = error.errors.map((err) => ({
      path: err.path.join('.'),
      message: err.message,
      code: err.code,
    }))
    return NextResponse.json(
      {
        message: 'Validation failed',
        errors: errors,
      },
      { status: 400 },
    )
  }
  throw error; // Re-throw if it's not a ZodError
}
