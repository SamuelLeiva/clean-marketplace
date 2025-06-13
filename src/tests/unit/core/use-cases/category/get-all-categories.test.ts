import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetAllCategories } from '@/core/use-cases/category'; // Adjust path as needed
import { CategoryRepository } from '@/core/ports'; // Adjust path as needed
import { Category } from '@/core/entities';

describe('GetAllCategories Use Case', () => {
  let getAllCategories: GetAllCategories;
  let mockRepo: CategoryRepository;

  // Sample categories for testing
  const sampleCategories: Category[] = [
    { id: 'cat1', name: 'Electronics', description: 'Gadgets and devices', createdAt: '2024-01-01T08:00:00.000Z', updatedAt: '2024-01-01T08:00:00.000Z' },
    { id: 'cat2', name: 'Books', description: 'Fiction and non-fiction titles', createdAt: '2024-01-02T09:00:00.000Z', updatedAt: '2024-01-02T09:00:00.000Z' },
    { id: 'cat3', name: 'Home Appliances', description: undefined, createdAt: '2024-01-03T10:00:00.000Z', updatedAt: '2024-01-03T10:00:00.000Z' },
  ];

  beforeEach(() => {
    mockRepo = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(), // Mock this method specifically
      update: vi.fn(),
      delete: vi.fn(),
      findByName: vi.fn(),
      isInUse: vi.fn(),
    };

    getAllCategories = new GetAllCategories(mockRepo);
    vi.clearAllMocks();
  });

// Successful Category Retrieval

  it('should return an array of all categories when categories exist', async () => {
    // Arrange
    vi.mocked(mockRepo.findAll).mockResolvedValue(sampleCategories);

    // Act
    const result = await getAllCategories.execute();

    // Assert
    expect(mockRepo.findAll).toHaveBeenCalledOnce();
    expect(result).toEqual(sampleCategories);
    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBe(sampleCategories.length);
    result.forEach((category, index) => {
      expect(category.id).toBe(sampleCategories[index].id);
      expect(category.name).toBe(sampleCategories[index].name);
      expect(category.description).toBe(sampleCategories[index].description);
      expect(category.createdAt).toBe(sampleCategories[index].createdAt);
      expect(category.updatedAt).toBe(sampleCategories[index].updatedAt);
    });
  });

  it('should return an empty array when no categories exist in the repository', async () => {
    // Arrange
    vi.mocked(mockRepo.findAll).mockResolvedValue([]); // Mock an empty array

    // Act
    const result = await getAllCategories.execute();

    // Assert
    expect(mockRepo.findAll).toHaveBeenCalledOnce();
    expect(result).toEqual([]);
    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBe(0);
  });

  it('should return categories with all expected properties, including optional description', async () => {
    // Arrange
    vi.mocked(mockRepo.findAll).mockResolvedValue([sampleCategories[2]]); // Test with a category having undefined description

    // Act
    const [category] = await getAllCategories.execute();

    // Assert
    expect(category).toBeDefined();
    expect(category.id).toBe(sampleCategories[2].id);
    expect(category.name).toBe(sampleCategories[2].name);
    expect(category.description).toBeUndefined(); // Should be undefined as per sampleCategories[2]
    expect(category.createdAt).toBe(sampleCategories[2].createdAt);
    expect(category.updatedAt).toBe(sampleCategories[2].updatedAt);
    expect(Object.keys(category)).toEqual(Object.keys(sampleCategories[2]));
  });

// Repository Error Handling

  it('should propagate repository errors when findAll fails', async () => {
    // Arrange
    const repositoryError = new Error('Database connection lost');
    vi.mocked(mockRepo.findAll).mockRejectedValue(repositoryError);

    // Act & Assert
    await expect(getAllCategories.execute()).rejects.toThrow('Database connection lost');
    expect(mockRepo.findAll).toHaveBeenCalledOnce();
  });

  it('should propagate generic errors from the repository', async () => {
    // Arrange
    const genericError = new Error('Unexpected repository error on category list retrieval');
    vi.mocked(mockRepo.findAll).mockRejectedValue(genericError);

    // Act & Assert
    await expect(getAllCategories.execute()).rejects.toThrow(genericError);
    expect(mockRepo.findAll).toHaveBeenCalledOnce();
  });

// Method Call Sequence

  it('should only call the findAll method on the repository', async () => {
    // Arrange
    vi.mocked(mockRepo.findAll).mockResolvedValue(sampleCategories);

    // Act
    await getAllCategories.execute();

    // Assert
    expect(mockRepo.findAll).toHaveBeenCalledOnce();
    expect(mockRepo.create).not.toHaveBeenCalled();
    expect(mockRepo.findById).not.toHaveBeenCalled();
    expect(mockRepo.update).not.toHaveBeenCalled();
    expect(mockRepo.delete).not.toHaveBeenCalled();
    expect(mockRepo.findByName).not.toHaveBeenCalled();
    expect(mockRepo.isInUse).not.toHaveBeenCalled();
  });
});