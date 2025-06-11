import { ProductNotFoundError } from '@/core/errors/product'
import { describe, expect, test } from 'vitest'

describe('ProductNotFoundError', () => {
  test('should create an error with default message, code and status code', () => {
    const productId = 'NotFoundId'
    const err = new ProductNotFoundError(productId)

    expect(err).toBeInstanceOf(ProductNotFoundError)
    expect(err.message).toBe(`Product with ID ${productId} was not found`)
    expect(err.code).toBe('PRODUCT_NOT_FOUND')
    expect(err.statusCode).toBe(404)
  })
})