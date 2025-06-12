import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GetAllProducts } from '@/core/use-cases/product'
import { Product } from '@/core/entities/Product'
import { ProductRepository } from '@/core/ports/ProductRepository'
import { v4 as uuidv4 } from 'uuid'

describe('GetAllProducts Use Case', () => {
  let mockProductRepo: ProductRepository
  let getAllProducts: GetAllProducts

  // Datos de ejemplo para los tests
  const sampleProducts: Product[] = [
    {
      id: uuidv4(),
      name: 'Laptop Gamer',
      description: 'Potente laptop para juegos de última generación',
      price: 1500.0,
      categoryId: uuidv4(),
    },
    {
      id: uuidv4(),
      name: 'Teclado Mecánico',
      description:
        'Teclado con switches Cherry MX para una experiencia de escritura superior',
      price: 120.5,
      categoryId: uuidv4(),
    },
    {
      id: uuidv4(),
      name: 'Monitor UltraWide',
      description: 'Monitor curvo de 34 pulgadas con resolución 4K',
      price: 750.0,
      categoryId: uuidv4(),
    },
  ]

  beforeEach(() => {
    // Inicializar el mock del repositorio y la instancia del caso de uso antes de cada test
    mockProductRepo = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(), // Asegurarse de que findAll sea un mock de Vitest
      update: vi.fn(),
      delete: vi.fn(),
      findByName: vi.fn(),
      isInUse: vi.fn(),
    }

    getAllProducts = new GetAllProducts(mockProductRepo)

    // Limpiar todos los mocks antes de cada test
    vi.clearAllMocks()
  })

  it('should return all products from the repository when products exist', async () => {
    // Arrange
    // Configurar el mock para que findAll devuelva los productos de ejemplo
    vi.mocked(mockProductRepo.findAll).mockResolvedValue(sampleProducts)

    // Act
    const products = await getAllProducts.execute()

    // Assert
    // Verificar que el método findAll del repositorio fue llamado exactamente una vez
    expect(mockProductRepo.findAll).toHaveBeenCalledOnce()
    // Verificar que la lista de productos devuelta es igual a los productos de ejemplo
    expect(products).toEqual(sampleProducts)
    // Verificar que la cantidad de productos es correcta
    expect(products).toHaveLength(sampleProducts.length)
    // Verificar que todos los productos tienen una ID de tipo string (asumiendo que uuidv4 devuelve strings)
    expect(products.every((p) => typeof p.id === 'string')).toBe(true)
  })

  it('should return an empty array when no products exist in the repository', async () => {
    // Arrange
    // Configurar el mock para que findAll devuelva un array vacío
    vi.mocked(mockProductRepo.findAll).mockResolvedValue([])

    // Act
    const products = await getAllProducts.execute()

    // Assert
    // Verificar que el método findAll del repositorio fue llamado
    expect(mockProductRepo.findAll).toHaveBeenCalledOnce()
    // Verificar que se devuelve un array vacío
    expect(products).toEqual([])
    expect(products).toHaveLength(0)
  })

  it('should propagate errors from the repository', async () => {
    // Arrange
    const repositoryError = new Error(
      'Database connection failed during product retrieval',
    )
    // Configurar el mock para que findAll rechace la promesa con un error
    vi.mocked(mockProductRepo.findAll).mockRejectedValue(repositoryError)

    // Act & Assert
    // Verificar que el caso de uso lanza el mismo error que el repositorio
    await expect(getAllProducts.execute()).rejects.toThrow(
      'Database connection failed during product retrieval',
    )
    // Verificar que el método findAll del repositorio fue llamado antes de que se lanzara el error
    expect(mockProductRepo.findAll).toHaveBeenCalledOnce()
  })

  it('should only call the findAll method of the repository', async () => {
    // Arrange
    vi.mocked(mockProductRepo.findAll).mockResolvedValue(sampleProducts)

    // Act
    await getAllProducts.execute()

    // Assert
    // Verificar que solo findAll fue llamado y ningún otro método del repositorio
    expect(mockProductRepo.findAll).toHaveBeenCalledOnce()
    expect(mockProductRepo.create).not.toHaveBeenCalled()
    expect(mockProductRepo.findById).not.toHaveBeenCalled()
    expect(mockProductRepo.update).not.toHaveBeenCalled()
    expect(mockProductRepo.delete).not.toHaveBeenCalled()
    expect(mockProductRepo.findByName).not.toHaveBeenCalled()
    expect(mockProductRepo.isInUse).not.toHaveBeenCalled()
  })

  it('should ensure the returned products match the structure of the Product entity', async () => {
    // Arrange
    vi.mocked(mockProductRepo.findAll).mockResolvedValue(sampleProducts)

    // Act
    const products = await getAllProducts.execute()

    // Assert
    // Verificar que cada producto en el array devuelto tiene las propiedades esperadas
    products.forEach((product) => {
      expect(product).toHaveProperty('id')
      expect(typeof product.id).toBe('string')
      expect(product).toHaveProperty('name')
      expect(typeof product.name).toBe('string')
      expect(product).toHaveProperty('description')
      expect(typeof product.description).toBe('string')
      expect(product).toHaveProperty('price')
      expect(typeof product.price).toBe('number')
      expect(product).toHaveProperty('categoryId')
      expect(typeof product.categoryId).toBe('string')
    })
  })
})
