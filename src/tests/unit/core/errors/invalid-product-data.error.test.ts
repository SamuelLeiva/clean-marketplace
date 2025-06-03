import { InvalidProductDataError } from '@/core/errors'
import { describe, expect, test } from 'vitest'

describe('InvalidProductDataError', () => {
  test('should create an error with default message and status code', () => {
    const err = new InvalidProductDataError()

    expect(err).toBeInstanceOf(InvalidProductDataError)
    expect(err.message).toBe('Invalid product data')
    expect(err.code).toBe('INVALID_PRODUCT_DATA')
    expect(err.statusCode).toBe(422)
  })

  test('should include extra details in stack trace if provided', () => {
    const details = { name: 'Missing' }
    const err = new InvalidProductDataError(details)

    expect(err.stack).toContain('name')
    expect(err.stack).toContain('Missing')
  })

  test('should include raw string details in stack if provided as string', () => {
    const err = new InvalidProductDataError('Custom error details')

    expect(err.stack).toBe('Custom error details')
  })
})