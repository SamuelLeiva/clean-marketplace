import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GetProductById } from '@/core/use-cases/product'
import { Product } from '@/core/entities/Product'
import { ProductRepository } from '@/core/ports/ProductRepository'
import { ProductNotFoundError } from '@/core/errors/product'
import { v4 as uuidv4 } from 'uuid'

describe('GetProductById Use Case', () => {
  let mockProductRepo: ProductRepository
  let getProductById: GetProductById

  // Un producto de ejemplo para usar en los tests
  const sampleProduct: Product = {
    id: uuidv4(),
    name: 'Auriculares Inalámbricos',
    description: 'Auriculares con cancelación de ruido y batería de larga duración',
    price: 199.99,
    categoryId: uuidv4(),
  }

  beforeEach(() => {
    // Inicializar el mock del repositorio y la instancia del caso de uso antes de cada test
    mockProductRepo = {
      create: vi.fn(),
      findById: vi.fn(), // Asegurarse de que findById sea un mock de Vitest
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findByName: vi.fn(),
      isInUse: vi.fn(),
    }

    getProductById = new GetProductById(mockProductRepo)

    // Limpiar todos los mocks antes de cada test
    vi.clearAllMocks()
  })


  it('should return a product when a valid ID is provided', async () => {
    // Arrange
    // Configurar el mock para que findById devuelva el producto de ejemplo
    vi.mocked(mockProductRepo.findById).mockResolvedValue(sampleProduct)

    // Act
    const result = await getProductById.execute(sampleProduct.id)

    // Assert
    // Verificar que el método findById del repositorio fue llamado una vez con la ID correcta
    expect(mockProductRepo.findById).toHaveBeenCalledOnce()
    expect(mockProductRepo.findById).toHaveBeenCalledWith(sampleProduct.id)
    // Verificar que el producto devuelto es el esperado
    expect(result).toEqual(sampleProduct)
  })

  it('should return a product with all its properties intact', async () => {
    // Arrange
    vi.mocked(mockProductRepo.findById).mockResolvedValue(sampleProduct)

    // Act
    const result = await getProductById.execute(sampleProduct.id)

    // Assert
    // Verificar que todas las propiedades del producto se mantienen

    expect(result!.id).toBe(sampleProduct.id)
    expect(result!.name).toBe(sampleProduct.name)
    expect(result!.description).toBe(sampleProduct.description)
    expect(result!.price).toBe(sampleProduct.price)
    expect(result!.categoryId).toBe(sampleProduct.categoryId)
  })


  it('should throw ProductNotFoundError when the product does not exist', async () => {
    // Arrange
    const nonExistentId = uuidv4()
    // Configurar el mock para que findById devuelva null (producto no encontrado)
    vi.mocked(mockProductRepo.findById).mockResolvedValue(null)

    // Act & Assert
    // Verificar que se lanza la excepción ProductNotFoundError
    await expect(getProductById.execute(nonExistentId)).rejects.toThrow(ProductNotFoundError)
    // Verificar que el mensaje de error es el correcto
    await expect(getProductById.execute(nonExistentId)).rejects.toThrow(`Product with ID ${nonExistentId} was not found`)
    // Verificar que el método findById fue llamado
    expect(mockProductRepo.findById).toHaveBeenCalled()
    expect(mockProductRepo.findById).toHaveBeenCalledWith(nonExistentId)
  })

  it('should throw ProductNotFoundError when findById returns undefined', async () => {
    // Arrange
    const nonExistentId = uuidv4()
    // Configurar el mock para que findById devuelva undefined
    vi.mocked(mockProductRepo.findById).mockResolvedValue(null)

    // Act & Assert
    await expect(getProductById.execute(nonExistentId)).rejects.toThrow(ProductNotFoundError)
    await expect(getProductById.execute(nonExistentId)).rejects.toThrow(`Product with ID ${nonExistentId} was not found`)
    expect(mockProductRepo.findById).toHaveBeenCalled()
    expect(mockProductRepo.findById).toHaveBeenCalledWith(nonExistentId)
  })

  it('should propagate errors from the repository findById method', async () => {
    // Arrange
    const productId = uuidv4()
    const repositoryError = new Error('Database connection failed during product lookup')
    // Configurar el mock para que findById rechace la promesa con un error
    vi.mocked(mockProductRepo.findById).mockRejectedValue(repositoryError)

    // Act & Assert
    // Verificar que el caso de uso lanza el mismo error que el repositorio
    await expect(getProductById.execute(productId)).rejects.toThrow('Database connection failed during product lookup')
    // Verificar que el método findById del repositorio fue llamado
    expect(mockProductRepo.findById).toHaveBeenCalledOnce()
    expect(mockProductRepo.findById).toHaveBeenCalledWith(productId)
  })

  it('should only call the findById method of the repository', async () => {
    // Arrange
    vi.mocked(mockProductRepo.findById).mockResolvedValue(sampleProduct)

    // Act
    await getProductById.execute(sampleProduct.id)

    // Assert
    // Verificar que solo findById fue llamado y ningún otro método del repositorio
    expect(mockProductRepo.findById).toHaveBeenCalledOnce()
    expect(mockProductRepo.create).not.toHaveBeenCalled()
    expect(mockProductRepo.findAll).not.toHaveBeenCalled()
    expect(mockProductRepo.update).not.toHaveBeenCalled()
    expect(mockProductRepo.delete).not.toHaveBeenCalled()
    expect(mockProductRepo.findByName).not.toHaveBeenCalled()
    expect(mockProductRepo.isInUse).not.toHaveBeenCalled()
  })

  it('should handle special characters in the ID gracefully if the repository supports it', async () => {
    // Note: Assuming a UUID is used, which typically doesn't contain problematic special characters.
    // If IDs could contain arbitrary characters, further validation might be needed at the input layer.
    const specialId = 'prod-123_abc-!@#' // Example of an ID with special characters (for illustrative purposes)
    const productWithSpecialId: Product = { ...sampleProduct, id: specialId }

    vi.mocked(mockProductRepo.findById).mockResolvedValue(productWithSpecialId)

    const result = await getProductById.execute(specialId)

    expect(mockProductRepo.findById).toHaveBeenCalledWith(specialId)
    expect(result!.id).toBe(specialId)
  })

  it('should handle very long IDs if the repository supports them', async () => {
    const longId = 'a'.repeat(100) + uuidv4() // Example of a very long ID
    const productWithLongId: Product = { ...sampleProduct, id: longId }

    vi.mocked(mockProductRepo.findById).mockResolvedValue(productWithLongId)

    const result = await getProductById.execute(longId)

    expect(mockProductRepo.findById).toHaveBeenCalledWith(longId)
    expect(result!.id).toBe(longId)
  })
})