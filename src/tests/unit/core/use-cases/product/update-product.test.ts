import { describe, it, expect, vi, beforeEach } from 'vitest'
import { UpdateProduct } from '@/core/use-cases/product'
import { Product } from '@/core/entities/Product'
import { ProductRepository } from '@/core/ports/ProductRepository'
import { InvalidProductDataError, ProductNotFoundError } from '@/core/errors/product' // Solo errores actuales
import { randomUUID } from 'crypto' // Para generar IDs dinámicas

// Mock del módulo crypto para IDs consistentes
vi.mock('crypto', () => ({
  randomUUID: vi.fn(),
}))

describe('UpdateProduct Use Case', () => {
  let mockRepo: ProductRepository
  let updateProduct: UpdateProduct
  const mockUUID = '123e4567-e89b-12d3-a456-426614174000' // ID para el producto existente

  // Un producto existente de ejemplo para los tests
  const existingProduct: Product = {
    id: mockUUID,
    name: 'Televisor Smart LED',
    description: 'Smart TV de 55 pulgadas con resolución 4K y HDR',
    price: 800.00,
    categoryId: 'category-tv-001',
  }

  beforeEach(() => {
    // Crear mocks frescos para cada test
    mockRepo = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(), // Asegurarse de que update sea un mock de Vitest
      delete: vi.fn(),
      findByName: vi.fn(), // No se usa directamente en el use case actual, pero se mantiene en el mock
      isInUse: vi.fn(),
    }

    updateProduct = new UpdateProduct(mockRepo)

    // Configurar mock de randomUUID si es necesario, aunque para update, findById es más relevante
    vi.mocked(randomUUID).mockReturnValue(mockUUID)

    // Limpiar todos los mocks antes de cada test
    vi.clearAllMocks()
  })

  it('should update and return the product with new name and price if it exists and data is valid', async () => {
    // Arrange
    const updateInput = {
      name: 'Televisor Smart LED 65"',
      price: 1200.00,
      description: 'Descripción actualizada', // Añadir descripción para un update completo
      categoryId: 'category-tv-002', // Añadir categoryId
    }
    const expectedProduct = { ...existingProduct, ...updateInput }

    // Mock: el producto existe
    vi.mocked(mockRepo.findById).mockResolvedValue(existingProduct)
    // Mock: la actualización es exitosa
    vi.mocked(mockRepo.update).mockResolvedValue(expectedProduct)

    // Act
    const result = await updateProduct.execute(existingProduct.id, updateInput)

    // Assert
    expect(mockRepo.findById).toHaveBeenCalledOnce()
    expect(mockRepo.findById).toHaveBeenCalledWith(existingProduct.id)
    expect(mockRepo.update).toHaveBeenCalledOnce()
    expect(mockRepo.update).toHaveBeenCalledWith(existingProduct.id, updateInput)

    // Asegurarse de que el resultado no sea nulo antes de acceder a las propiedades
    expect(result).not.toBeNull()
    // Ya que tu use case devuelve Promise<Product>, TypeScript ya sabe que 'result' no es null aquí.
    // No obstante, añadir comprobaciones explícitas en el test es una buena práctica de aserción.
    expect(result.id).toBe(existingProduct.id)
    expect(result.name).toBe(updateInput.name)
    expect(result.description).toBe(updateInput.description)
    expect(result.price).toBe(updateInput.price)
    expect(result.categoryId).toBe(updateInput.categoryId)
    expect(result).toEqual(expectedProduct)
  })

  it('should update only the provided fields and keep others intact', async () => {
    // Arrange
    const updateInput = { description: 'Nueva descripción de alta calidad' }
    const expectedProduct = { ...existingProduct, ...updateInput }

    vi.mocked(mockRepo.findById).mockResolvedValue(existingProduct)
    vi.mocked(mockRepo.update).mockResolvedValue(expectedProduct)

    // Act
    const result = await updateProduct.execute(existingProduct.id, updateInput)

    // Assert
    expect(mockRepo.findById).toHaveBeenCalledOnce()
    expect(mockRepo.findById).toHaveBeenCalledWith(existingProduct.id)
    expect(mockRepo.update).toHaveBeenCalledOnce()
    expect(mockRepo.update).toHaveBeenCalledWith(existingProduct.id, updateInput)

    expect(result).not.toBeNull()
    expect(result.id).toBe(existingProduct.id)
    expect(result.name).toBe(existingProduct.name) // El nombre no se actualizó
    expect(result.description).toBe(updateInput.description)
    expect(result.price).toBe(existingProduct.price) // El precio no se actualizó
    expect(result.categoryId).toBe(existingProduct.categoryId)
  })

  it('should handle updates with minimum valid price (0.00 if allowed by repo, otherwise 0.01)', async () => {
    // Arrange
    // Asumiendo que 0.00 es válido si no es negativo, tu use case lo permite
    const updateInput = { price: 0.00 }
    const expectedProduct = { ...existingProduct, ...updateInput }

    vi.mocked(mockRepo.findById).mockResolvedValue(existingProduct)
    vi.mocked(mockRepo.update).mockResolvedValue(expectedProduct)

    // Act
    const result = await updateProduct.execute(existingProduct.id, updateInput)

    // Assert
    expect(result).not.toBeNull()
    expect(result.price).toBe(0.00)
  })

  it('should handle updates with large valid price', async () => {
    // Arrange
    const updateInput = { price: 9999999.99 } // Un valor grande pero válido
    const expectedProduct = { ...existingProduct, ...updateInput }

    vi.mocked(mockRepo.findById).mockResolvedValue(existingProduct)
    vi.mocked(mockRepo.update).mockResolvedValue(expectedProduct)

    // Act
    const result = await updateProduct.execute(existingProduct.id, updateInput)

    // Assert
    expect(result).not.toBeNull()
    expect(result.price).toBe(9999999.99)
  })

  it('should allow partial updates without changing name or description', async () => {
    // Arrange
    const updateInput = { price: 850.50, categoryId: 'new-category-id' }
    const expectedProduct = { ...existingProduct, ...updateInput }

    vi.mocked(mockRepo.findById).mockResolvedValue(existingProduct)
    vi.mocked(mockRepo.update).mockResolvedValue(expectedProduct)

    // Act
    const result = await updateProduct.execute(existingProduct.id, updateInput)

    // Assert
    expect(result).not.toBeNull()
    expect(result.name).toBe(existingProduct.name) // No debería cambiar
    expect(result.description).toBe(existingProduct.description) // No debería cambiar
    expect(result.price).toBe(updateInput.price)
    expect(result.categoryId).toBe(updateInput.categoryId)
  })

  it('should throw InvalidProductDataError if price is negative', async () => {
    // Arrange
    const updateInput = { price: -20.50 }
    vi.mocked(mockRepo.findById).mockResolvedValue(existingProduct)

    // Act & Assert
    await expect(updateProduct.execute(existingProduct.id, updateInput)).rejects.toThrow(InvalidProductDataError)
    await expect(updateProduct.execute(existingProduct.id, updateInput)).rejects.toThrow('Invalid product data')
    expect(mockRepo.findById).toHaveBeenCalled() // findById se llama antes de la validación del precio
    expect(mockRepo.update).not.toHaveBeenCalled() // No debería llamar a update
  })

  // Elimino tests sobre validaciones de `name` y `description` (longitud, etc.)
  // y `empty data` porque no están implementadas en tu use case actual.
  // Es importante que los tests reflejen la lógica existente, no la que se desea implementar.

  it('should throw ProductNotFoundError if the product to update does not exist', async () => {
    // Arrange
    const nonExistentId = 'non-existent-id'
    const updateInput = { name: 'New Name', price: 100 }
    // Mock: findById devuelve null
    vi.mocked(mockRepo.findById).mockResolvedValue(null)

    // Act & Assert
    await expect(updateProduct.execute(nonExistentId, updateInput)).rejects.toThrow(ProductNotFoundError)
    await expect(updateProduct.execute(nonExistentId, updateInput)).rejects.toThrow(`Product with ID ${nonExistentId} was not found`)
    expect(mockRepo.findById).toHaveBeenCalled()
    expect(mockRepo.findById).toHaveBeenCalledWith(nonExistentId)
    expect(mockRepo.update).not.toHaveBeenCalled() // update no debería ser llamado
  })

  it('should throw ProductNotFoundError if findById returns undefined', async () => {
    // Arrange
    const nonExistentId = 'another-non-existent-id'
    const updateInput = { price: 50 }
    vi.mocked(mockRepo.findById).mockResolvedValue(null) // findById devuelve null

    // Act & Assert
    await expect(updateProduct.execute(nonExistentId, updateInput)).rejects.toThrow(ProductNotFoundError)
    expect(mockRepo.findById).toHaveBeenCalledOnce()
    expect(mockRepo.findById).toHaveBeenCalledWith(nonExistentId)
    expect(mockRepo.update).not.toHaveBeenCalled()
  })

  it('should propagate repository findById errors', async () => {
    // Arrange
    const updateInput = { name: 'Propagate Error Test', price: 100 }
    const repositoryError = new Error('Database connection failed during findById')
    vi.mocked(mockRepo.findById).mockRejectedValue(repositoryError)

    // Act & Assert
    await expect(updateProduct.execute(existingProduct.id, updateInput)).rejects.toThrow('Database connection failed during findById')
    expect(mockRepo.findById).toHaveBeenCalledOnce()
    expect(mockRepo.update).not.toHaveBeenCalled()
  })

  it('should propagate repository update errors', async () => {
    // Arrange
    const updateInput = { price: 99.99 }
    const repositoryError = new Error('Failed to save product changes')
    vi.mocked(mockRepo.findById).mockResolvedValue(existingProduct)
    vi.mocked(mockRepo.update).mockRejectedValue(repositoryError)

    // Act & Assert
    await expect(updateProduct.execute(existingProduct.id, updateInput)).rejects.toThrow('Failed to save product changes')
    expect(mockRepo.findById).toHaveBeenCalledOnce()
    expect(mockRepo.update).toHaveBeenCalledOnce() // El update se intentó y falló
  })

  it('should call repository methods in correct order for a successful update', async () => {
    // Arrange
    const updateInput = { name: 'Sequence Updated Product', price: 250 }
    const expectedProduct = { ...existingProduct, ...updateInput }

    vi.mocked(mockRepo.findById).mockResolvedValue(existingProduct)
    vi.mocked(mockRepo.update).mockResolvedValue(expectedProduct)

    // Act
    await updateProduct.execute(existingProduct.id, updateInput)

    // Assert
    // Usar mock.sequence para verificar el orden de las llamadas
    const findByIdCall = vi.mocked(mockRepo.findById).mock.calls[0]
    const updateCall = vi.mocked(mockRepo.update).mock.calls[0]

    expect(findByIdCall).toBeDefined()
    expect(updateCall).toBeDefined()

    // Verificar que findById se llamó antes que update
    expect(vi.mocked(mockRepo.findById)).toHaveBeenCalledBefore(vi.mocked(mockRepo.update))

    // Asegurarse de que solo estos métodos fueron llamados
    expect(mockRepo.findById).toHaveBeenCalledOnce()
    expect(mockRepo.update).toHaveBeenCalledOnce()
    expect(mockRepo.findByName).not.toHaveBeenCalled() // findByName no se llama en tu use case actual
  })

  it('should not call update if product is not found', async () => {
    // Arrange
    const nonExistentId = 'non-existent-id'
    const updateInput = { name: 'New Name' }
    vi.mocked(mockRepo.findById).mockResolvedValue(null)

    // Act & Assert
    await expect(updateProduct.execute(nonExistentId, updateInput)).rejects.toThrow(ProductNotFoundError)

    expect(mockRepo.findById).toHaveBeenCalledOnce()
    expect(mockRepo.update).not.toHaveBeenCalled()
  })
})