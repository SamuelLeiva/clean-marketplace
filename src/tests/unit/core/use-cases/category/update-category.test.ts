import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateCategory } from '@/core/use-cases/category'; // Adjust path as needed
import { CategoryRepository } from '@/core/ports'; // Adjust path as needed
import { Category } from '@/core/entities';
import { CategoryNotFoundError } from '@/core/errors/category'; // Ensure this error is defined
import { UpdateCategoryInput } from '@/shared/contracts'; // Import the UpdateCategoryInput contract

describe('UpdateCategory Use Case', () => {
  let updateCategory: UpdateCategory;
  let mockRepo: CategoryRepository;

  // An existing category for testing updates
  const existingCategory: Category = {
    id: 'category-to-update-123',
    name: 'Juguetes',
    description: 'Juegos y diversión para todas las edades.',
  };

  beforeEach(() => {
    // Create fresh mocks for each test
    mockRepo = {
      create: vi.fn(),
      findById: vi.fn(), // Mock for finding the category
      findAll: vi.fn(),
      update: vi.fn(), // Mock for updating the category
      delete: vi.fn(),
      findByName: vi.fn(),
      isInUse: vi.fn(),
    };

    updateCategory = new UpdateCategory(mockRepo);

    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  it('should update and return the category with new name and description if it exists', async () => {
    // Arrange
    const updateInput: UpdateCategoryInput = {
      name: 'Juguetes y Juegos',
      description: 'Entretenimiento y ocio para niños y adultos.',
    };
    const expectedCategory: Category = { ...existingCategory, ...updateInput };

    // Mock: category exists
    vi.mocked(mockRepo.findById).mockResolvedValue(existingCategory);
    // Mock: update is successful
    vi.mocked(mockRepo.update).mockResolvedValue(expectedCategory);

    // Act
    const result = await updateCategory.execute(existingCategory.id, updateInput);

    // Assert
    expect(mockRepo.findById).toHaveBeenCalledOnce();
    expect(mockRepo.findById).toHaveBeenCalledWith(existingCategory.id);
    expect(mockRepo.update).toHaveBeenCalledOnce();
    expect(mockRepo.update).toHaveBeenCalledWith(existingCategory.id, updateInput);

    expect(result).not.toBeNull();
    expect(result.id).toBe(existingCategory.id);
    expect(result.name).toBe(updateInput.name);
    expect(result.description).toBe(updateInput.description);
    expect(result).toEqual(expectedCategory);
  });

  it('should update only the provided fields and keep others intact', async () => {
    // Arrange
    const updateInput: UpdateCategoryInput = { description: 'Una descripción actualizada' };
    const expectedCategory: Category = { ...existingCategory, ...updateInput };

    vi.mocked(mockRepo.findById).mockResolvedValue(existingCategory);
    vi.mocked(mockRepo.update).mockResolvedValue(expectedCategory);

    // Act
    const result = await updateCategory.execute(existingCategory.id, updateInput);

    // Assert
    expect(mockRepo.findById).toHaveBeenCalledOnce();
    expect(mockRepo.findById).toHaveBeenCalledWith(existingCategory.id);
    expect(mockRepo.update).toHaveBeenCalledOnce();
    expect(mockRepo.update).toHaveBeenCalledWith(existingCategory.id, updateInput);

    expect(result).not.toBeNull();
    expect(result.id).toBe(existingCategory.id);
    expect(result.name).toBe(existingCategory.name); // Name should remain unchanged
    expect(result.description).toBe(updateInput.description);
  });

  it('should handle updates with minimal valid name and description lengths', async () => {
    // Arrange
    const updateInput: UpdateCategoryInput = {
      name: 'Cat', // Min 3 chars
      description: 'Min description', // Min 10 chars
    };
    const expectedCategory: Category = { ...existingCategory, ...updateInput };

    vi.mocked(mockRepo.findById).mockResolvedValue(existingCategory);
    vi.mocked(mockRepo.update).mockResolvedValue(expectedCategory);

    // Act
    const result = await updateCategory.execute(existingCategory.id, updateInput);

    // Assert
    expect(result.name).toBe(updateInput.name);
    expect(result.description).toBe(updateInput.description);
  });

  it('should handle updates with maximal valid name and description lengths', async () => {
    // Arrange
    const updateInput: UpdateCategoryInput = {
      name: 'X'.repeat(100), // Max 100 chars
      description: 'Y'.repeat(500), // Max 500 chars
    };
    const expectedCategory: Category = { ...existingCategory, ...updateInput };

    vi.mocked(mockRepo.findById).mockResolvedValue(existingCategory);
    vi.mocked(mockRepo.update).mockResolvedValue(expectedCategory);

    // Act
    const result = await updateCategory.execute(existingCategory.id, updateInput);

    // Assert
    expect(result.name).toBe(updateInput.name);
    expect(result.description).toBe(updateInput.description);
  });

  it('should allow setting description to undefined (omitting it) if it was previously set', async () => {
    // Arrange
    const categoryWithDescription: Category = {
      id: 'cat-desc-123',
      name: 'Software',
      description: 'Some software description.',
    };
    const updateInput: UpdateCategoryInput = {
      description: undefined, // Explicitly set to undefined to remove it
    };
    // Expected result: description property should be omitted or undefined
    const expectedCategory: Category = {
      id: categoryWithDescription.id,
      name: categoryWithDescription.name,
      description: undefined, // Or omit if your ORM truly removes it
    };

    vi.mocked(mockRepo.findById).mockResolvedValue(categoryWithDescription);
    vi.mocked(mockRepo.update).mockResolvedValue(expectedCategory);

    // Act
    const result = await updateCategory.execute(categoryWithDescription.id, updateInput);

    // Assert
    expect(result.description).toBeUndefined();
    expect(mockRepo.update).toHaveBeenCalledWith(categoryWithDescription.id, updateInput);
  });

  it('should allow setting description from undefined to a value', async () => {
    // Arrange
    const categoryWithoutDescription: Category = {
      id: 'cat-no-desc-456',
      name: 'Hardware',
      description: undefined,
    };
    const updateInput: UpdateCategoryInput = {
      description: 'Components and peripherals for computers.',
    };
    const expectedCategory: Category = { ...categoryWithoutDescription, ...updateInput };

    vi.mocked(mockRepo.findById).mockResolvedValue(categoryWithoutDescription);
    vi.mocked(mockRepo.update).mockResolvedValue(expectedCategory);

    // Act
    const result = await updateCategory.execute(categoryWithoutDescription.id, updateInput);

    // Assert
    expect(result.description).toBe(updateInput.description);
    expect(mockRepo.update).toHaveBeenCalledWith(categoryWithoutDescription.id, updateInput);
  });

  it('should throw CategoryNotFoundError if the category to update does not exist', async () => {
    // Arrange
    const nonExistentId = 'non-existent-category-id';
    const updateInput: UpdateCategoryInput = { name: 'New Category Name' };
    // Mock: findById returns null
    vi.mocked(mockRepo.findById).mockResolvedValue(null);

    // Act & Assert
    await expect(updateCategory.execute(nonExistentId, updateInput)).rejects.toThrow(CategoryNotFoundError);
    await expect(updateCategory.execute(nonExistentId, updateInput)).rejects.toThrow(`Category with ID ${nonExistentId} was not found`);
    expect(mockRepo.findById).toHaveBeenCalled();
    expect(mockRepo.findById).toHaveBeenCalledWith(nonExistentId);
    expect(mockRepo.update).not.toHaveBeenCalled(); // update should not be called
  });

  it('should throw CategoryNotFoundError if findById returns undefined', async () => {
    // Arrange
    const nonExistentId = 'another-non-existent-id';
    const updateInput: UpdateCategoryInput = { description: 'New description' };
    vi.mocked(mockRepo.findById).mockResolvedValue(null); // findById returns undefined

    // Act & Assert
    await expect(updateCategory.execute(nonExistentId, updateInput)).rejects.toThrow(CategoryNotFoundError);
    expect(mockRepo.findById).toHaveBeenCalledOnce();
    expect(mockRepo.findById).toHaveBeenCalledWith(nonExistentId);
    expect(mockRepo.update).not.toHaveBeenCalled();
  });

  it('should propagate repository findById errors', async () => {
    // Arrange
    const updateInput: UpdateCategoryInput = { name: 'Propagate Error Test' };
    const repositoryError = new Error('Database connection failed during findById');
    vi.mocked(mockRepo.findById).mockRejectedValue(repositoryError);

    // Act & Assert
    await expect(updateCategory.execute(existingCategory.id, updateInput)).rejects.toThrow('Database connection failed during findById');
    expect(mockRepo.findById).toHaveBeenCalledOnce();
    expect(mockRepo.update).not.toHaveBeenCalled();
  });

  it('should propagate repository update errors', async () => {
    // Arrange
    const updateInput: UpdateCategoryInput = { description: 'Failed update' };
    const repositoryError = new Error('Failed to save category changes');
    vi.mocked(mockRepo.findById).mockResolvedValue(existingCategory);
    vi.mocked(mockRepo.update).mockRejectedValue(repositoryError);

    // Act & Assert
    await expect(updateCategory.execute(existingCategory.id, updateInput)).rejects.toThrow('Failed to save category changes');
    expect(mockRepo.findById).toHaveBeenCalledOnce();
    expect(mockRepo.update).toHaveBeenCalledOnce(); // The update was attempted and failed
  });

  it('should call repository methods in correct order for a successful update', async () => {
    // Arrange
    const updateInput: UpdateCategoryInput = { name: 'Sequence Updated Category' };
    const expectedCategory = { ...existingCategory, ...updateInput };

    vi.mocked(mockRepo.findById).mockResolvedValue(existingCategory);
    vi.mocked(mockRepo.update).mockResolvedValue(expectedCategory);

    // Act
    await updateCategory.execute(existingCategory.id, updateInput);

    // Assert
    const findByIdCall = vi.mocked(mockRepo.findById).mock.calls[0];
    const updateCall = vi.mocked(mockRepo.update).mock.calls[0];

    expect(findByIdCall).toBeDefined();
    expect(updateCall).toBeDefined();

    // Verify that findById was called before update
    expect(vi.mocked(mockRepo.findById)).toHaveBeenCalledBefore(vi.mocked(mockRepo.update));

    // Ensure only these methods were called
    expect(mockRepo.findById).toHaveBeenCalledOnce();
    expect(mockRepo.update).toHaveBeenCalledOnce();
    expect(mockRepo.create).not.toHaveBeenCalled();
    expect(mockRepo.findAll).not.toHaveBeenCalled();
    expect(mockRepo.delete).not.toHaveBeenCalled();
    expect(mockRepo.findByName).not.toHaveBeenCalled();
    expect(mockRepo.isInUse).not.toHaveBeenCalled();
  });

  it('should not call update if category is not found', async () => {
    // Arrange
    const nonExistentId = 'non-existent-id-sequence';
    const updateInput: UpdateCategoryInput = { name: 'New Name' };
    vi.mocked(mockRepo.findById).mockResolvedValue(null);

    // Act & Assert
    await expect(updateCategory.execute(nonExistentId, updateInput)).rejects.toThrow(CategoryNotFoundError);

    expect(mockRepo.findById).toHaveBeenCalledOnce();
    expect(mockRepo.update).not.toHaveBeenCalled();
  });
});