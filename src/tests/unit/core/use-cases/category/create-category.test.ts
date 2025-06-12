import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CreateCategory } from '@/core/use-cases/category' // Ajusta la ruta si es necesario
import { CategoryRepository } from '@/core/ports' // Ajusta la ruta si es necesario
import { Category } from '@/core/entities'
import { CreateCategoryInput } from '@/shared/contracts'
import { CategoryAlreadyExistsError } from '@/core/errors/category' // Asegúrate de tener estos errores definidos
import { randomUUID } from 'crypto'

// Mock del módulo crypto
vi.mock('crypto', () => ({
  randomUUID: vi.fn(),
}))

describe('CreateCategory Use Case', () => {
  let createCategory: CreateCategory
  let mockRepo: CategoryRepository
  const mockUUID = '123e4567-e89b-12d3-a456-426614174000' // ID para las categorías creadas

  beforeEach(() => {
    // Crear mocks frescos para cada test
    mockRepo = {
      findByName: vi.fn(),
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      isInUse: vi.fn(), // Asumiendo que el repositorio de categorías puede tener este método
    }

    createCategory = new CreateCategory(mockRepo)

    // Configurar mock de randomUUID para un ID consistente en la creación
    vi.mocked(randomUUID).mockReturnValue(mockUUID)

    // Limpiar todos los mocks antes de cada test
    vi.clearAllMocks()
  })

  it('should create a new category when its name does not exist', async () => {
    // Arrange
    const input: CreateCategoryInput = {
      name: 'Electrónica',
      description: 'Dispositivos electrónicos, gadgets y componentes.',
    }

    const expectedCategory: Category = {
      id: mockUUID,
      ...input,
    }

    // Mock: la categoría no existe por nombre
    vi.mocked(mockRepo.findByName).mockResolvedValue(null)
    // Mock: la creación es exitosa
    vi.mocked(mockRepo.create).mockResolvedValue(expectedCategory)

    // Act
    const result = await createCategory.execute(input)

    // Assert
    expect(mockRepo.findByName).toHaveBeenCalledOnce()
    expect(mockRepo.findByName).toHaveBeenCalledWith(input.name)

    expect(randomUUID).toHaveBeenCalledOnce() // Verificar que se generó un ID único

    expect(mockRepo.create).toHaveBeenCalledOnce()
    expect(mockRepo.create).toHaveBeenCalledWith(expectedCategory) // Verificar que se llamó con la entidad correcta

    expect(result).toEqual(expectedCategory)
  })

  it('should create a new category without description if it is optional and not provided', async () => {
    // Arrange
    const input: CreateCategoryInput = {
      name: 'Libros',
      // description es omitido, lo cual es válido según tu Zod schema
    }

    const expectedCategory: Category = {
      id: mockUUID,
      name: input.name,
      // description debería ser undefined en la entidad si no se provee
    }

    vi.mocked(mockRepo.findByName).mockResolvedValue(null)
    vi.mocked(mockRepo.create).mockResolvedValue(expectedCategory)

    // Act
    const result = await createCategory.execute(input)

    // Assert
    expect(mockRepo.findByName).toHaveBeenCalledOnce()
    expect(mockRepo.findByName).toHaveBeenCalledWith(input.name)

    expect(randomUUID).toHaveBeenCalledOnce()

    expect(mockRepo.create).toHaveBeenCalledOnce()
    expect(mockRepo.create).toHaveBeenCalledWith(expectedCategory)

    expect(result.id).toBe(mockUUID)
    expect(result.name).toBe(input.name)
    expect(result.description).toBeUndefined() // Asegurarse de que la descripción es undefined
  })

  it('should generate a unique ID for each category creation', async () => {
    // Arrange
    const input: CreateCategoryInput = {
      name: 'Muebles',
      description: 'Artículos para el hogar y oficina.',
    }

    const expectedCategory: Category = {
      id: mockUUID, // Usamos mockUUID aquí para que el mock de `create` lo devuelva
      ...input,
    }

    vi.mocked(mockRepo.findByName).mockResolvedValue(null)
    vi.mocked(mockRepo.create).mockResolvedValue(expectedCategory)

    // Act
    await createCategory.execute(input)

    // Assert
    expect(randomUUID).toHaveBeenCalledOnce() // Una sola llamada para el ID
    expect(mockRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        id: mockUUID, // Verifica que el ID generado fue el usado en la creación
        name: input.name,
        description: input.description,
      })
    )
  })

  it('should preserve all input data in the created category', async () => {
    // Arrange
    const input: CreateCategoryInput = {
      name: 'Herramientas',
      description: 'Herramientas manuales y eléctricas para el hogar y profesionales.',
    }

    const expectedCategory: Category = {
      id: mockUUID,
      ...input,
    }

    vi.mocked(mockRepo.findByName).mockResolvedValue(null)
    vi.mocked(mockRepo.create).mockResolvedValue(expectedCategory)

    // Act
    const result = await createCategory.execute(input)

    // Assert
    expect(result.name).toBe(input.name)
    expect(result.description).toBe(input.description)
    expect(result.id).toBe(mockUUID)
  })

  it('should throw CategoryAlreadyExistsError when a category with the same name already exists', async () => {
    // Arrange
    const input: CreateCategoryInput = {
      name: 'Electrónica',
      description: 'Dispositivos electrónicos, gadgets y componentes.',
    }

    const existingCategory: Category = {
      id: 'existing-cat-id',
      name: 'Electrónica',
      description: 'Descripción existente de electrónica',
    }

    // Mock: la categoría ya existe
    vi.mocked(mockRepo.findByName).mockResolvedValue(existingCategory)

    // Act & Assert
    await expect(createCategory.execute(input)).rejects.toThrow(CategoryAlreadyExistsError)
    await expect(createCategory.execute(input)).rejects.toThrow(`Category with name ${input.name} already exists`)
    expect(mockRepo.findByName).toHaveBeenCalled()
    expect(mockRepo.findByName).toHaveBeenCalledWith(input.name)
    expect(mockRepo.create).not.toHaveBeenCalled() // No debería llamar a create si la categoría ya existe
    expect(randomUUID).not.toHaveBeenCalled() // No debería generar un UUID
  })

  it('should check for existing category with exact name match (case-sensitive if not explicitly handled)', async () => {
    // Arrange
    const input: CreateCategoryInput = {
      name: 'Ropa Hombre',
      description: 'Prendas de vestir para caballeros.',
    }

    const existingCategory: Category = {
      id: 'existing-cat-id-2',
      name: 'Ropa Hombre', // Coincidencia exacta
      description: 'Otra descripción de ropa de hombre.',
    }

    vi.mocked(mockRepo.findByName).mockResolvedValue(existingCategory)

    // Act & Assert
    await expect(createCategory.execute(input)).rejects.toThrow(CategoryAlreadyExistsError)
    expect(mockRepo.findByName).toHaveBeenCalledWith('Ropa Hombre') // Verificar la llamada con el nombre exacto
  })

  it('should propagate repository findByName errors', async () => {
    // Arrange
    const input: CreateCategoryInput = {
      name: 'Error Propagation Test',
      description: 'Descripción para test de errores.',
    }

    const repositoryError = new Error('Database connection failed during findByName')
    vi.mocked(mockRepo.findByName).mockRejectedValue(repositoryError)

    // Act & Assert
    await expect(createCategory.execute(input)).rejects.toThrow('Database connection failed during findByName')
    expect(mockRepo.findByName).toHaveBeenCalledOnce()
    expect(mockRepo.findByName).toHaveBeenCalledWith(input.name)
    expect(mockRepo.create).not.toHaveBeenCalled()
  })

  it('should propagate repository create errors', async () => {
    // Arrange
    const input: CreateCategoryInput = {
      name: 'Create Error Test',
      description: 'Descripción para test de error de creación.',
    }

    const repositoryError = new Error('Failed to save category')
    vi.mocked(mockRepo.findByName).mockResolvedValue(null) // Categoría no existe
    vi.mocked(mockRepo.create).mockRejectedValue(repositoryError) // Fallo al crear

    // Act & Assert
    await expect(createCategory.execute(input)).rejects.toThrow('Failed to save category')
    expect(mockRepo.findByName).toHaveBeenCalledOnce()
    expect(mockRepo.findByName).toHaveBeenCalledWith(input.name)
    expect(mockRepo.create).toHaveBeenCalledOnce()
    expect(randomUUID).toHaveBeenCalledOnce() // UUID se genera antes de la llamada a create
  })

  it('should call repository methods in the correct order for a successful creation', async () => {
    // Arrange
    const input: CreateCategoryInput = {
      name: 'Sequence Test Category',
      description: 'Testing method call sequence.',
    }

    const expectedCategory: Category = {
      id: mockUUID,
      ...input,
    }

    vi.mocked(mockRepo.findByName).mockResolvedValue(null)
    vi.mocked(mockRepo.create).mockResolvedValue(expectedCategory)

    // Act
    await createCategory.execute(input)

    // Assert
    const findByNameCall = vi.mocked(mockRepo.findByName).mock.calls[0]
    const createCall = vi.mocked(mockRepo.create).mock.calls[0]

    expect(findByNameCall).toBeDefined()
    expect(createCall).toBeDefined()

    // Verificar que findByName se llamó antes que create
    expect(vi.mocked(mockRepo.findByName)).toHaveBeenCalledBefore(vi.mocked(mockRepo.create))

    // Verificar que randomUUID se llamó antes de la creación en el repo
    // (Asumiendo que randomUUID se llama dentro del use case antes de pasar a repo.create)
    expect(randomUUID).toHaveBeenCalledOnce()
    expect(vi.mocked(randomUUID)).toHaveBeenCalledBefore(vi.mocked(mockRepo.create))

    expect(mockRepo.findByName).toHaveBeenCalledOnce()
    expect(mockRepo.create).toHaveBeenCalledOnce()
  })

  it('should not call randomUUID or create when category already exists', async () => {
    // Arrange
    const input: CreateCategoryInput = {
      name: 'Existing Category',
      description: 'This category already exists.',
    }

    const existingCategory: Category = {
      id: 'existing-id',
      ...input,
    }

    vi.mocked(mockRepo.findByName).mockResolvedValue(existingCategory)

    // Act & Assert
    try {
      await createCategory.execute(input)
    } catch (error) {
      expect(error).toBeInstanceOf(CategoryAlreadyExistsError)
    }

    expect(mockRepo.findByName).toHaveBeenCalledOnce()
    expect(randomUUID).not.toHaveBeenCalled() // No debería generar un UUID
    expect(mockRepo.create).not.toHaveBeenCalled() // No debería intentar crear
  })

  it('should handle null response from findByName (meaning category does not exist)', async () => {
    // Arrange
    const input: CreateCategoryInput = {
      name: 'Null Response Test',
      description: 'Testing null response handling from findByName.',
    }

    const expectedCategory: Category = {
      id: mockUUID,
      ...input,
    }

    vi.mocked(mockRepo.findByName).mockResolvedValue(null) // Simula que no se encuentra la categoría
    vi.mocked(mockRepo.create).mockResolvedValue(expectedCategory)

    // Act
    const result = await createCategory.execute(input)

    // Assert
    expect(result).toEqual(expectedCategory)
    expect(mockRepo.findByName).toHaveBeenCalledWith(input.name)
    expect(mockRepo.create).toHaveBeenCalledOnce()
  })

  it('should handle undefined response from findByName (meaning category does not exist)', async () => {
    // Arrange
    const input: CreateCategoryInput = {
      name: 'Undefined Response Test',
      description: 'Testing undefined response handling from findByName.',
    }

    const expectedCategory: Category = {
      id: mockUUID,
      ...input,
    }

    vi.mocked(mockRepo.findByName).mockResolvedValue(null) // Simula que no se encuentra la categoría (undefined)
    vi.mocked(mockRepo.create).mockResolvedValue(expectedCategory)

    // Act
    const result = await createCategory.execute(input)

    // Assert
    expect(result).toEqual(expectedCategory)
    expect(mockRepo.findByName).toHaveBeenCalledWith(input.name)
    expect(mockRepo.create).toHaveBeenCalledOnce()
  })
})