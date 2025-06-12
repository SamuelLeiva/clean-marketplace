import { ProductAlreadyExistsError } from '@/core/errors/product'
import { describe, expect, test } from 'vitest'

describe('ProductAlreadyExistsError', () => {
  test('should create an error with default message, code and status code', () => {
    const productName = 'ExistingProduct'
    const err = new ProductAlreadyExistsError(productName)

    expect(err).toBeInstanceOf(ProductAlreadyExistsError)
    expect(err.message).toBe(`Product with name ${productName} already exists`)
    expect(err.code).toBe('PRODUCT_ALREADY_EXISTS')
    expect(err.statusCode).toBe(409)
  })
})