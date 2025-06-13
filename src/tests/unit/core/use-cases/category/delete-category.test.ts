import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DeleteCategory } from '@/core/use-cases/category' // Adjust path as needed
import { CategoryRepository } from '@/core/ports' // Adjust path as needed
import { Category } from '@/core/entities'
import {
  CategoryNotFoundError,
  CannotDeleteCategoryError,
} from '@/core/errors/category' // Ensure these errors are defined

describe('DeleteCategory Use Case', () => {
  let deleteCategory: DeleteCategory
  let mockRepo: CategoryRepository

  // An example category for testing
  const existingCategory: Category = {
    id: 'category-to-delete-123',
    name: 'Electrónica',
    description: 'Dispositivos electrónicos y gadgets.',
    createdAt: '2024-01-01T10:00:00.000Z',
    updatedAt: '2024-01-01T10:00:00.000Z',
  }

  beforeEach(() => {
    mockRepo = {
      create: vi.fn(),
      findById: vi.fn(), // Mock for finding the category
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(), // Mock for deleting the category
      findByName: vi.fn(),
      isInUse: vi.fn(), // Mock for checking if category is in use
    }

    deleteCategory = new DeleteCategory(mockRepo)
    vi.clearAllMocks()
  })

  // Successful Category Deletion

  it('should delete a category when a valid ID is provided and it is not in use', async () => {
    // Arrange
    vi.mocked(mockRepo.findById).mockResolvedValue(existingCategory)
    vi.mocked(mockRepo.isInUse).mockResolvedValue(false)
    vi.mocked(mockRepo.delete).mockResolvedValue(undefined) // delete returns void

    // Act
    const result = await deleteCategory.execute(existingCategory.id)

    // Assert
    expect(mockRepo.findById).toHaveBeenCalledOnce()
    expect(mockRepo.findById).toHaveBeenCalledWith(existingCategory.id)
    expect(mockRepo.isInUse).toHaveBeenCalledOnce()
    expect(mockRepo.isInUse).toHaveBeenCalledWith(existingCategory.id)
    expect(mockRepo.delete).toHaveBeenCalledOnce()
    expect(mockRepo.delete).toHaveBeenCalledWith(existingCategory.id)
    expect(result).toBeUndefined() // Expect void return
  })

  // Handling Category Not Found

  it('should throw CategoryNotFoundError if the category does not exist', async () => {
    // Arrange
    const nonExistentId = 'non-existent-category-id'
    vi.mocked(mockRepo.findById).mockResolvedValue(null) // Use null for "not found"

    // Act & Assert
    await expect(deleteCategory.execute(nonExistentId)).rejects.toThrow(
      CategoryNotFoundError,
    )
    await expect(deleteCategory.execute(nonExistentId)).rejects.toThrow(
      `Category with ID ${nonExistentId} was not found`,
    )
    expect(mockRepo.findById).toHaveBeenCalled()
    expect(mockRepo.findById).toHaveBeenCalledWith(nonExistentId)
    expect(mockRepo.isInUse).not.toHaveBeenCalled() // No need to check if not found
    expect(mockRepo.delete).not.toHaveBeenCalled() // Delete should not be called
  })

  // Handling Category Cannot Be Deleted (In Use)

  it('should throw CannotDeleteCategoryError if the category is in use', async () => {
    // Arrange
    vi.mocked(mockRepo.findById).mockResolvedValue(existingCategory)
    vi.mocked(mockRepo.isInUse).mockResolvedValue(true) // Category IS in use

    // Act & Assert
    await expect(deleteCategory.execute(existingCategory.id)).rejects.toThrow(
      CannotDeleteCategoryError,
    )
    await expect(deleteCategory.execute(existingCategory.id)).rejects.toThrow(
      `Cannot delete Category with ID ${existingCategory.id} because it is in use`,
    )
    expect(mockRepo.findById).toHaveBeenCalled()
    expect(mockRepo.findById).toHaveBeenCalledWith(existingCategory.id)
    expect(mockRepo.isInUse).toHaveBeenCalled()
    expect(mockRepo.isInUse).toHaveBeenCalledWith(existingCategory.id)
    expect(mockRepo.delete).not.toHaveBeenCalled() // Delete should not be called
  })

  // Repository Error Handling

  it('should propagate repository findById errors', async () => {
    // Arrange
    const repositoryError = new Error(
      'Database connection failed during findById',
    )
    vi.mocked(mockRepo.findById).mockRejectedValue(repositoryError)

    // Act & Assert
    await expect(deleteCategory.execute(existingCategory.id)).rejects.toThrow(
      'Database connection failed during findById',
    )
    expect(mockRepo.findById).toHaveBeenCalledOnce()
    expect(mockRepo.delete).not.toHaveBeenCalled()
    expect(mockRepo.isInUse).not.toHaveBeenCalled()
  })

  it('should propagate repository isInUse errors', async () => {
    // Arrange
    const repositoryError = new Error('Database error checking category usage')
    vi.mocked(mockRepo.findById).mockResolvedValue(existingCategory)
    vi.mocked(mockRepo.isInUse).mockRejectedValue(repositoryError)

    // Act & Assert
    await expect(deleteCategory.execute(existingCategory.id)).rejects.toThrow(
      'Database error checking category usage',
    )
    expect(mockRepo.findById).toHaveBeenCalledOnce()
    expect(mockRepo.isInUse).toHaveBeenCalledOnce()
    expect(mockRepo.delete).not.toHaveBeenCalled()
  })

  it('should propagate repository delete errors', async () => {
    // Arrange
    const repositoryError = new Error('Failed to delete category in database')
    vi.mocked(mockRepo.findById).mockResolvedValue(existingCategory)
    vi.mocked(mockRepo.isInUse).mockResolvedValue(false)
    vi.mocked(mockRepo.delete).mockRejectedValue(repositoryError)

    // Act & Assert
    await expect(deleteCategory.execute(existingCategory.id)).rejects.toThrow(
      'Failed to delete category in database',
    )
    expect(mockRepo.findById).toHaveBeenCalledOnce()
    expect(mockRepo.isInUse).toHaveBeenCalledOnce()
    expect(mockRepo.delete).toHaveBeenCalledOnce()
  })

  // Method Call Sequence

  it('should call repository methods in the correct order for a successful deletion', async () => {
    // Arrange
    vi.mocked(mockRepo.findById).mockResolvedValue(existingCategory)
    vi.mocked(mockRepo.isInUse).mockResolvedValue(false)
    vi.mocked(mockRepo.delete).mockResolvedValue(undefined)

    // Act
    await deleteCategory.execute(existingCategory.id)

    // Assert
    expect(vi.mocked(mockRepo.findById)).toHaveBeenCalledBefore(
      vi.mocked(mockRepo.isInUse),
    )
    expect(vi.mocked(mockRepo.isInUse)).toHaveBeenCalledBefore(
      vi.mocked(mockRepo.delete),
    )

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
    await expect(deleteCategory.execute(nonExistentId)).rejects.toThrow(
      CategoryNotFoundError,
    )

    expect(mockRepo.findById).toHaveBeenCalledOnce()
    expect(mockRepo.isInUse).not.toHaveBeenCalled()
    expect(mockRepo.delete).not.toHaveBeenCalled()
  })

  it('should not call delete if category is in use', async () => {
    // Arrange
    vi.mocked(mockRepo.findById).mockResolvedValue(existingCategory)
    vi.mocked(mockRepo.isInUse).mockResolvedValue(true)

    // Act & Assert
    await expect(deleteCategory.execute(existingCategory.id)).rejects.toThrow(
      CannotDeleteCategoryError,
    )

    expect(mockRepo.findById).toHaveBeenCalledOnce()
    expect(mockRepo.isInUse).toHaveBeenCalledOnce()
    expect(mockRepo.delete).not.toHaveBeenCalled()
  })
})
