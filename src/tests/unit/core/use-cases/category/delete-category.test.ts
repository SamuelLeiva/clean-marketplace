import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DeleteCategory } from '@/core/use-cases/category' // Adjust path as needed
import { CategoryRepository } from '@/core/ports' // Adjust path as needed
import { Category } from '@/core/entities'
import { CategoryNotFoundError, CannotDeleteCategoryError } from '@/core/errors/category' // Use CannotDeleteCategoryError

describe('DeleteCategory Use Case', () => {
  let deleteCategory: DeleteCategory
  let mockRepo: CategoryRepository

  // An example category for testing
  const existingCategory: Category = {
    id: 'category-to-delete-123',
    name: 'Electrónica',
    description: 'Dispositivos electrónicos y gadgets.',
  }

  beforeEach(() => {
    // Create fresh mocks for each test
    mockRepo = {
      create: vi.fn(),
      findById: vi.fn(), // Mock for finding the category
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(), // Mock for deleting the category
      findByName: vi.fn(),
      isInUse: vi.fn(), // Mock for checking if category is in use, as it's called in the use case
    }

    deleteCategory = new DeleteCategory(mockRepo)

    // Clear all mocks before each test
    vi.clearAllMocks()
  })

  it('should delete a category when a valid ID is provided and it is not in use', async () => {
    // Arrange
    // Mock: category exists
    vi.mocked(mockRepo.findById).mockResolvedValue(existingCategory)
    // Mock: category is not in use (as per your comment, this will be false for now)
    vi.mocked(mockRepo.isInUse).mockResolvedValue(false)
    // Mock: delete operation is successful
    vi.mocked(mockRepo.delete).mockResolvedValue(undefined) // delete returns void

    // Act
    const result = await deleteCategory.execute(existingCategory.id)

    // Assert
    expect(mockRepo.findById).toHaveBeenCalledOnce()
    expect(mockRepo.findById).toHaveBeenCalledWith(existingCategory.id)
    expect(mockRepo.isInUse).toHaveBeenCalledOnce() // isInUse is always called
    expect(mockRepo.isInUse).toHaveBeenCalledWith(existingCategory.id)
    expect(mockRepo.delete).toHaveBeenCalledOnce()
    expect(mockRepo.delete).toHaveBeenCalledWith(existingCategory.id)
    expect(result).toBeUndefined() // Expect void return
  })

  it('should throw CategoryNotFoundError if the category does not exist', async () => {
    // Arrange
    const nonExistentId = 'non-existent-category-id'
    // Mock: findById returns null
    vi.mocked(mockRepo.findById).mockResolvedValue(null)

    // Act & Assert
    await expect(deleteCategory.execute(nonExistentId)).rejects.toThrow(CategoryNotFoundError)
    await expect(deleteCategory.execute(nonExistentId)).rejects.toThrow(`Category with ID ${nonExistentId} was not found`)
    expect(mockRepo.findById).toHaveBeenCalled()
    expect(mockRepo.findById).toHaveBeenCalledWith(nonExistentId)
    expect(mockRepo.isInUse).not.toHaveBeenCalled() // No need to check if not found
    expect(mockRepo.delete).not.toHaveBeenCalled() // Delete should not be called
  })

  it('should throw CategoryNotFoundError if findById returns undefined', async () => {
    // Arrange
    const nonExistentId = 'undefined-category-id'
    // Mock: findById returns undefined
    vi.mocked(mockRepo.findById).mockResolvedValue(null)

    // Act & Assert
    await expect(deleteCategory.execute(nonExistentId)).rejects.toThrow(CategoryNotFoundError)
    expect(mockRepo.findById).toHaveBeenCalledOnce()
    expect(mockRepo.findById).toHaveBeenCalledWith(nonExistentId)
    expect(mockRepo.isInUse).not.toHaveBeenCalled()
    expect(mockRepo.delete).not.toHaveBeenCalled()
  })

  it('should throw CannotDeleteCategoryError if the category is in use', async () => {
    // Arrange
    // Mock: category exists
    vi.mocked(mockRepo.findById).mockResolvedValue(existingCategory)
    // Mock: category IS in use (simulating future behavior)
    vi.mocked(mockRepo.isInUse).mockResolvedValue(true)

    // Act & Assert
    await expect(deleteCategory.execute(existingCategory.id)).rejects.toThrow(CannotDeleteCategoryError)
    await expect(deleteCategory.execute(existingCategory.id)).rejects.toThrow(`Cannot delete Category with ID ${existingCategory.id} because it is in use`)
    expect(mockRepo.findById).toHaveBeenCalled()
    expect(mockRepo.findById).toHaveBeenCalledWith(existingCategory.id)
    expect(mockRepo.isInUse).toHaveBeenCalled()
    expect(mockRepo.isInUse).toHaveBeenCalledWith(existingCategory.id)
    expect(mockRepo.delete).not.toHaveBeenCalled() // Delete should not be called
  })

  it('should propagate repository findById errors', async () => {
    // Arrange
    const repositoryError = new Error('Database connection failed during findById')
    vi.mocked(mockRepo.findById).mockRejectedValue(repositoryError)

    // Act & Assert
    await expect(deleteCategory.execute(existingCategory.id)).rejects.toThrow('Database connection failed during findById')
    expect(mockRepo.findById).toHaveBeenCalledOnce()
    expect(mockRepo.delete).not.toHaveBeenCalled()
    expect(mockRepo.isInUse).not.toHaveBeenCalled() // No call to isInUse if findById fails
  })

  it('should propagate repository isInUse errors', async () => {
    // Arrange
    const repositoryError = new Error('Database error checking category usage')
    vi.mocked(mockRepo.findById).mockResolvedValue(existingCategory)
    vi.mocked(mockRepo.isInUse).mockRejectedValue(repositoryError)

    // Act & Assert
    await expect(deleteCategory.execute(existingCategory.id)).rejects.toThrow('Database error checking category usage')
    expect(mockRepo.findById).toHaveBeenCalledOnce()
    expect(mockRepo.isInUse).toHaveBeenCalledOnce()
    expect(mockRepo.delete).not.toHaveBeenCalled()
  })

  it('should propagate repository delete errors', async () => {
    // Arrange
    const repositoryError = new Error('Failed to delete category in database')
    vi.mocked(mockRepo.findById).mockResolvedValue(existingCategory)
    vi.mocked(mockRepo.isInUse).mockResolvedValue(false) // Not in use
    vi.mocked(mockRepo.delete).mockRejectedValue(repositoryError)

    // Act & Assert
    await expect(deleteCategory.execute(existingCategory.id)).rejects.toThrow('Failed to delete category in database')
    expect(mockRepo.findById).toHaveBeenCalledOnce()
    expect(mockRepo.isInUse).toHaveBeenCalledOnce()
    expect(mockRepo.delete).toHaveBeenCalledOnce() // Delete was attempted and failed
  })

  it('should call repository methods in the correct order for a successful deletion', async () => {
    // Arrange
    vi.mocked(mockRepo.findById).mockResolvedValue(existingCategory)
    vi.mocked(mockRepo.isInUse).mockResolvedValue(false)
    vi.mocked(mockRepo.delete).mockResolvedValue(undefined)

    // Act
    await deleteCategory.execute(existingCategory.id)

    // Assert
    // Check call order
    expect(vi.mocked(mockRepo.findById)).toHaveBeenCalledBefore(vi.mocked(mockRepo.isInUse))
    expect(vi.mocked(mockRepo.isInUse)).toHaveBeenCalledBefore(vi.mocked(mockRepo.delete))

    // Ensure only relevant methods were called
    expect(mockRepo.findById).toHaveBeenCalledOnce()
    expect(mockRepo.isInUse).toHaveBeenCalledOnce()
    expect(mockRepo.delete).toHaveBeenCalledOnce()
    expect(mockRepo.create).not.toHaveBeenCalled()
    expect(mockRepo.findAll).not.toHaveBeenCalled()
    expect(mockRepo.update).not.toHaveBeenCalled()
    expect(mockRepo.findByName).not.toHaveBeenCalled()
  })

  it('should not call isInUse or delete if category is not found', async () => {
    // Arrange
    const nonExistentId = 'non-existent-id-sequence'
    vi.mocked(mockRepo.findById).mockResolvedValue(null)

    // Act & Assert
    await expect(deleteCategory.execute(nonExistentId)).rejects.toThrow(CategoryNotFoundError)

    expect(mockRepo.findById).toHaveBeenCalledOnce()
    expect(mockRepo.isInUse).not.toHaveBeenCalled()
    expect(mockRepo.delete).not.toHaveBeenCalled()
  })

  it('should not call delete if category is in use', async () => {
    // Arrange
    vi.mocked(mockRepo.findById).mockResolvedValue(existingCategory)
    vi.mocked(mockRepo.isInUse).mockResolvedValue(true)

    // Act & Assert
    await expect(deleteCategory.execute(existingCategory.id)).rejects.toThrow(CannotDeleteCategoryError)

    expect(mockRepo.findById).toHaveBeenCalledOnce()
    expect(mockRepo.isInUse).toHaveBeenCalledOnce()
    expect(mockRepo.delete).not.toHaveBeenCalled() // Delete should not be called
  })
})