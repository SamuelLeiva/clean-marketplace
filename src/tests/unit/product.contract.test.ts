import { CreateProductInput } from '@/shared/contracts/product.contract'
import { describe, it, expect } from 'vitest'

// Mocks simples para validar los contratos
describe('CreateProductInput', () => {
  it('rejects invalid input', () => {
    const result = CreateProductInput.safeParse({
      name: 'A',
      price: -10,
      categoryId: 'invalid-uuid',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors.length).toBeGreaterThan(0)
    }
  })

  it('accepts valid input', () => {
    const result = CreateProductInput.safeParse({
      name: 'Guitar',
      price: 200,
      categoryId: '9e1a8be0-5dfb-4b44-a154-25ae4721f120',
    })

    expect(result.success).toBe(true)
  })
})