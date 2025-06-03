import { CannotDeleteProductError } from '@/core/errors'
import { describe, expect, test } from 'vitest'

describe('CannotDeleteProductError', () => {
  test('should create an error with default message and status code', () => {
    const productId = 'errorId'
    const err = new CannotDeleteProductError(productId)

    expect(err).toBeInstanceOf(CannotDeleteProductError)
    expect(err.message).toBe(`Cannot delete product with ID ${productId} because it is in use`)
    expect(err.code).toBe('CANNOT_DELETE_PRODUCT')
    expect(err.statusCode).toBe(409)
  })
})