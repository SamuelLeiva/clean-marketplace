import { ProductNotFoundError } from '@/core/errors/ProductNotFoundError'
import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

// se podría extender por ejemplo con errores de dominio, etc (ProductNotFoundError)
export function handleError(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        issues: error.issues,
      },
      { status: 400 },
    )
  }

  if (error instanceof ProductNotFoundError) {
    return NextResponse.json({ error: error.message }, { status: 404 })
  }

  if (error instanceof Error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
}
