import { describe, it, expect, vi, beforeEach } from 'vitest'
import { UpdateCategory } from '@/core/use-cases/category' // Adjust path as needed
import { CategoryRepository } from '@/core/ports' // Adjust path as needed
import { Category } from '@/core/entities'
import { CategoryNotFoundError } from '@/core/errors/category' // Ensure this error is defined
import { UpdateCategoryInput } from '@/shared/contracts' // Import the UpdateCategoryInput contract

describe('UpdateCategory Use Case', () => {
  let updateCategory: UpdateCategory
  let mockRepo: CategoryRepository

  // An existing category for testing updates
  const existingCategory: Category = {
    id: 'category-to-update-123',
    name: 'Juguetes',
    description: 'Juegos y diversión para todas las edades.',
    createdAt: '2024-01-01T08:00:00.000Z',
    updatedAt: '2024-01-01T08:00:00.000Z',
  }

  beforeEach(() => {
    mockRepo = {
      create: vi.fn(),
      findById: vi.fn(), // Mock for finding the category
      findAll: vi.fn(),
      update: vi.fn(), // Mock for updating the category
      delete: vi.fn(),
      findByName: vi.fn(),
      isInUse: vi.fn(),
    }

    updateCategory = new UpdateCategory(mockRepo)
    vi.clearAllMocks()
  })

  // Successful Category Update

  it('should update and return the category with new name and description if it exists', async () => {
    // Arrange
    const updateInput: UpdateCategoryInput = {
      name: 'Juguetes y Juegos',
      description: 'Entretenimiento y ocio para niños y adultos.',
    }
    // The expected category after update (simulating repository's return value)
    const updatedCategory: Category = {
      ...existingCategory,
      ...updateInput,
      updatedAt: '2024-06-13T13:00:00.000Z', // Simulate updatedAt changing
    }

    // Mock: category exists
    vi.mocked(mockRepo.findById).mockResolvedValue(existingCategory)
    // Mock: update is successful and returns the updated category
    vi.mocked(mockRepo.update).mockResolvedValue(updatedCategory)

    // Act
    const result = await updateCategory.execute(
      existingCategory.id,
      updateInput,
    )

    // Assert
    expect(mockRepo.findById).toHaveBeenCalledOnce()
    expect(mockRepo.findById).toHaveBeenCalledWith(existingCategory.id)
    expect(mockRepo.update).toHaveBeenCalledOnce()
    expect(mockRepo.update).toHaveBeenCalledWith(
      existingCategory.id,
      updateInput,
    )

    expect(result).not.toBeNull()
    expect(result.id).toBe(existingCategory.id)
    expect(result.name).toBe(updateInput.name)
    expect(result.description).toBe(updateInput.description)
    expect(result.createdAt).toBe(existingCategory.createdAt)
    expect(result.updatedAt).toBe(updatedCategory.updatedAt)
    expect(result).toEqual(updatedCategory)
  })

  it('should update only the provided fields and keep others intact', async () => {
    // Arrange
    const updateInput: UpdateCategoryInput = {
      description: 'Una descripción actualizada',
    } // Only updating description
    const updatedCategory: Category = {
      ...existingCategory,
      ...updateInput,
      updatedAt: '2024-06-13T13:05:00.000Z',
    }

    vi.mocked(mockRepo.findById).mockResolvedValue(existingCategory)
    vi.mocked(mockRepo.update).mockResolvedValue(updatedCategory)

    // Act
    const result = await updateCategory.execute(
      existingCategory.id,
      updateInput,
    )

    // Assert
    expect(mockRepo.findById).toHaveBeenCalledOnce()
    expect(mockRepo.findById).toHaveBeenCalledWith(existingCategory.id)
    expect(mockRepo.update).toHaveBeenCalledOnce()
    expect(mockRepo.update).toHaveBeenCalledWith(
      existingCategory.id,
      updateInput,
    )

    expect(result.id).toBe(existingCategory.id)
    expect(result.name).toBe(existingCategory.name) // Name should remain unchanged
    expect(result.description).toBe(updateInput.description) // Description updated
    expect(result.updatedAt).toBe(updatedCategory.updatedAt)
  })

  it('should allow setting description to undefined (omitting it) if it was previously set', async () => {
    // Arrange
    const categoryWithDescription: Category = {
      id: 'cat-desc-123',
      name: 'Software',
      description: 'Some software description.',
      createdAt: '2024-01-01T08:00:00.000Z',
      updatedAt: '2024-01-01T08:00:00.000Z',
    }
    const updateInput: UpdateCategoryInput = {
      description: undefined, // Explicitly set to undefined to remove it
    }
    const updatedCategory: Category = {
      ...categoryWithDescription,
      description: undefined, // Description becomes undefined
      updatedAt: '2024-06-13T13:10:00.000Z',
    }

    vi.mocked(mockRepo.findById).mockResolvedValue(categoryWithDescription)
    vi.mocked(mockRepo.update).mockResolvedValue(updatedCategory)

    // Act
    const result = await updateCategory.execute(
      categoryWithDescription.id,
      updateInput,
    )

    // Assert
    expect(result.description).toBeUndefined()
    expect(mockRepo.update).toHaveBeenCalledWith(
      categoryWithDescription.id,
      updateInput,
    )
  })

  it('should allow setting description from undefined to a value', async () => {
    // Arrange
    const categoryWithoutDescription: Category = {
      id: 'cat-no-desc-456',
      name: 'Hardware',
      description: undefined,
      createdAt: '2024-01-01T08:00:00.000Z',
      updatedAt: '2024-01-01T08:00:00.000Z',
    }
    const updateInput: UpdateCategoryInput = {
      description: 'Components and peripherals for computers.',
    }
    const updatedCategory: Category = {
      ...categoryWithoutDescription,
      ...updateInput,
      updatedAt: '2024-06-13T13:15:00.000Z',
    }

    vi.mocked(mockRepo.findById).mockResolvedValue(categoryWithoutDescription)
    vi.mocked(mockRepo.update).mockResolvedValue(updatedCategory)

    // Act
    const result = await updateCategory.execute(
      categoryWithoutDescription.id,
      updateInput,
    )

    // Assert
    expect(result.description).toBe(updateInput.description)
    expect(mockRepo.update).toHaveBeenCalledWith(
      categoryWithoutDescription.id,
      updateInput,
    )
  })

  // Handling Category Not Found

  it('should throw CategoryNotFoundError if the category to update does not exist', async () => {
    // Arrange
    const nonExistentId = 'non-existent-category-id'
    const updateInput: UpdateCategoryInput = { name: 'New Category Name' }
    vi.mocked(mockRepo.findById).mockResolvedValue(null)

    // Act & Assert
    await expect(
      updateCategory.execute(nonExistentId, updateInput),
    ).rejects.toThrow(CategoryNotFoundError)
    await expect(
      updateCategory.execute(nonExistentId, updateInput),
    ).rejects.toThrow(`Category with ID ${nonExistentId} not found`)
    expect(mockRepo.findById).toHaveBeenCalled()
    expect(mockRepo.findById).toHaveBeenCalledWith(nonExistentId)
    expect(mockRepo.update).not.toHaveBeenCalled()
  })

  //Repository Error Handling

  it('should propagate repository findById errors', async () => {
    // Arrange
    const updateInput: UpdateCategoryInput = { name: 'Propagate Error Test' }
    const repositoryError = new Error(
      'Database connection failed during findById',
    )
    vi.mocked(mockRepo.findById).mockRejectedValue(repositoryError)

    // Act & Assert
    await expect(
      updateCategory.execute(existingCategory.id, updateInput),
    ).rejects.toThrow('Database connection failed during findById')
    expect(mockRepo.findById).toHaveBeenCalledOnce()
    expect(mockRepo.update).not.toHaveBeenCalled()
  })

  it('should propagate repository update errors', async () => {
    // Arrange
    const updateInput: UpdateCategoryInput = { description: 'Failed update' }
    const repositoryError = new Error('Failed to save category changes')
    vi.mocked(mockRepo.findById).mockResolvedValue(existingCategory)
    vi.mocked(mockRepo.update).mockRejectedValue(repositoryError)

    // Act & Assert
    await expect(
      updateCategory.execute(existingCategory.id, updateInput),
    ).rejects.toThrow('Failed to save category changes')
    expect(mockRepo.findById).toHaveBeenCalledOnce()
    expect(mockRepo.update).toHaveBeenCalledOnce()
  })

  // Method Call Sequence

  it('should call repository methods in correct order for a successful update', async () => {
    // Arrange
    const updateInput: UpdateCategoryInput = {
      name: 'Sequence Updated Category',
    }
    const updatedCategory = {
      ...existingCategory,
      ...updateInput,
      updatedAt: '2024-06-13T13:20:00.000Z',
    }

    vi.mocked(mockRepo.findById).mockResolvedValue(existingCategory)
    vi.mocked(mockRepo.update).mockResolvedValue(updatedCategory)

    // Act
    await updateCategory.execute(existingCategory.id, updateInput)

    // Assert
    const findByIdCall = vi.mocked(mockRepo.findById).mock.calls[0]
    const updateCall = vi.mocked(mockRepo.update).mock.calls[0]

    expect(findByIdCall).toBeDefined()
    expect(updateCall).toBeDefined()

    expect(vi.mocked(mockRepo.findById)).toHaveBeenCalledBefore(
      vi.mocked(mockRepo.update),
    )

    expect(mockRepo.findById).toHaveBeenCalledOnce()
    expect(mockRepo.update).toHaveBeenCalledOnce()
    expect(mockRepo.create).not.toHaveBeenCalled()
    expect(mockRepo.findAll).not.toHaveBeenCalled()
    expect(mockRepo.delete).not.toHaveBeenCalled()
    expect(mockRepo.findByName).not.toHaveBeenCalled()
    expect(mockRepo.isInUse).not.toHaveBeenCalled()
  })

  it('should not call update if category is not found', async () => {
    // Arrange
    const nonExistentId = 'non-existent-id-sequence'
    const updateInput: UpdateCategoryInput = { name: 'New Name' }
    vi.mocked(mockRepo.findById).mockResolvedValue(null)

    // Act & Assert
    await expect(
      updateCategory.execute(nonExistentId, updateInput),
    ).rejects.toThrow(CategoryNotFoundError)

    expect(mockRepo.findById).toHaveBeenCalledOnce()
    expect(mockRepo.update).not.toHaveBeenCalled()
  })
})
