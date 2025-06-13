import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GetCategoryById } from '@/core/use-cases/category' // Adjust path as needed
import { CategoryRepository } from '@/core/ports' // Adjust path as needed
import { Category } from '@/core/entities'
import { CategoryNotFoundError } from '@/core/errors/category' // Ensure this error is defined

describe('GetCategoryById Use Case', () => {
  let getCategoryById: GetCategoryById
  let mockRepo: CategoryRepository

  // An example category for testing
  const existingCategory: Category = {
    id: 'category-id-123',
    name: 'Ropa',
    description: 'Vestimenta y accesorios de moda.',
    createdAt: '2024-05-15T10:30:00.000Z',
    updatedAt: '2024-05-15T10:30:00.000Z',
  }

  beforeEach(() => {
    mockRepo = {
      create: vi.fn(),
      findById: vi.fn(), // Mock for finding the category by ID
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findByName: vi.fn(),
      isInUse: vi.fn(),
    }

    getCategoryById = new GetCategoryById(mockRepo)
    vi.clearAllMocks()
  })

  // Successful Category Retrieval

  it('should return the category when a valid ID is provided and the category exists', async () => {
    // Arrange
    vi.mocked(mockRepo.findById).mockResolvedValue(existingCategory)

    // Act
    const result = await getCategoryById.execute(existingCategory.id)

    // Assert
    expect(mockRepo.findById).toHaveBeenCalledOnce()
    expect(mockRepo.findById).toHaveBeenCalledWith(existingCategory.id)
    expect(result).toEqual(existingCategory)
    expect(result).toBeInstanceOf(Object)
    expect(result!.id).toBe(existingCategory.id)
    expect(result!.name).toBe(existingCategory.name)
    expect(result!.description).toBe(existingCategory.description)
    expect(result!.createdAt).toBe(existingCategory.createdAt)
    expect(result!.updatedAt).toBe(existingCategory.updatedAt)
  })

  it('should return a category correctly when its description is undefined', async () => {
    // Arrange
    const categoryWithoutDescription: Category = {
      id: 'cat-no-desc-456',
      name: 'Software',
      description: undefined, // Description is undefined
      createdAt: '2024-06-01T08:00:00.000Z',
      updatedAt: '2024-06-01T08:00:00.000Z',
    }
    vi.mocked(mockRepo.findById).mockResolvedValue(categoryWithoutDescription)

    // Act
    const result = await getCategoryById.execute(categoryWithoutDescription.id)

    // Assert
    expect(mockRepo.findById).toHaveBeenCalledOnce()
    expect(result).toEqual(categoryWithoutDescription)
    expect(result!.description).toBeUndefined()
  })

  // Handling Category Not Found

  it('should throw CategoryNotFoundError if the category with the provided ID does not exist', async () => {
    // Arrange
    const nonExistentId = 'non-existent-category-id-789'
    vi.mocked(mockRepo.findById).mockResolvedValue(null) // Use null for "not found"

    // Act & Assert
    await expect(getCategoryById.execute(nonExistentId)).rejects.toThrow(
      CategoryNotFoundError,
    )
    await expect(getCategoryById.execute(nonExistentId)).rejects.toThrow(
      `Category with ID ${nonExistentId} was not found`,
    )
    expect(mockRepo.findById).toHaveBeenCalled()
    expect(mockRepo.findById).toHaveBeenCalledWith(nonExistentId)
  })

  // Repository Error Handling

  it('should propagate repository errors when findById fails', async () => {
    // Arrange
    const repositoryError = new Error(
      'Database connection failed during findById',
    )
    vi.mocked(mockRepo.findById).mockRejectedValue(repositoryError)

    // Act & Assert
    await expect(getCategoryById.execute(existingCategory.id)).rejects.toThrow(
      'Database connection failed during findById',
    )
    expect(mockRepo.findById).toHaveBeenCalledOnce()
    expect(mockRepo.findById).toHaveBeenCalledWith(existingCategory.id)
  })

  it('should propagate generic errors from the repository', async () => {
    // Arrange
    const genericError = new Error(
      'Unexpected repository error on read operation',
    )
    vi.mocked(mockRepo.findById).mockRejectedValue(genericError)

    // Act & Assert
    await expect(getCategoryById.execute(existingCategory.id)).rejects.toThrow(
      genericError,
    )
    expect(mockRepo.findById).toHaveBeenCalledOnce()
  })

  // Method Call Sequence

  it('should only call the findById method on the repository', async () => {
    // Arrange
    vi.mocked(mockRepo.findById).mockResolvedValue(existingCategory)

    // Act
    await getCategoryById.execute(existingCategory.id)

    // Assert
    expect(mockRepo.findById).toHaveBeenCalledOnce()
    expect(mockRepo.create).not.toHaveBeenCalled()
    expect(mockRepo.findAll).not.toHaveBeenCalled()
    expect(mockRepo.update).not.toHaveBeenCalled()
    expect(mockRepo.delete).not.toHaveBeenCalled()
    expect(mockRepo.findByName).not.toHaveBeenCalled()
    expect(mockRepo.isInUse).not.toHaveBeenCalled()
  })
})
