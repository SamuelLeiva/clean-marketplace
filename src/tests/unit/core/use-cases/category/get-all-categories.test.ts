import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetAllCategories } from '@/core/use-cases/category'; // Adjust path as needed
import { CategoryRepository } from '@/core/ports'; // Adjust path as needed
import { Category } from '@/core/entities';
import { CategoryListResponse } from '@/shared/contracts'; // Import CategoryListResponse for type checking

describe('GetAllCategories Use Case', () => {
  let getAllCategories: GetAllCategories;
  let mockRepo: CategoryRepository;

  // Sample categories for testing
  const sampleCategories: Category[] = [
    { id: 'cat1', name: 'Electronics', description: 'Gadgets and devices' },
    { id: 'cat2', name: 'Books', description: 'Fiction and non-fiction titles' },
    { id: 'cat3', name: 'Home Appliances', description: 'Kitchen and home gadgets' },
  ];

  beforeEach(() => {
    // Create fresh mocks for each test
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

    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  it('should return an array of all categories when categories exist', async () => {
    // Arrange
    vi.mocked(mockRepo.findAll).mockResolvedValue(sampleCategories);

    // Act
    const result = await getAllCategories.execute();

    // Assert
    expect(mockRepo.findAll).toHaveBeenCalledOnce(); // Ensure the repository method was called
    expect(result).toEqual(sampleCategories); // Ensure the returned data matches the mock
    expect(result).toBeInstanceOf(Array); // Ensure it's an array
    expect(result.length).toBe(sampleCategories.length); // Check array length
    // Optional: Type check using CategoryListResponse
    // This isn't strictly necessary for a unit test of the use case,
    // as it tests the contract itself, but can be a good sanity check.
    const typedResult: CategoryListResponse = result;
    expect(typedResult).toBeInstanceOf(Array);
  });

  it('should return an empty array when no categories exist in the repository', async () => {
    // Arrange
    vi.mocked(mockRepo.findAll).mockResolvedValue([]); // Mock an empty array

    // Act
    const result = await getAllCategories.execute();

    // Assert
    expect(mockRepo.findAll).toHaveBeenCalledOnce();
    expect(result).toEqual([]); // Expect an empty array
    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBe(0);
  });

  it('should return categories with all expected properties', async () => {
    // Arrange
    vi.mocked(mockRepo.findAll).mockResolvedValue([sampleCategories[0]]); // Test with a single category

    // Act
    const [category] = await getAllCategories.execute();

    // Assert
    expect(category).toBeDefined();
    expect(category.id).toBe(sampleCategories[0].id);
    expect(category.name).toBe(sampleCategories[0].name);
    expect(category.description).toBe(sampleCategories[0].description);
    // Ensure no extra properties are returned (if your repository allows it, otherwise this might fail)
    expect(Object.keys(category)).toEqual(Object.keys(sampleCategories[0]));
  });

  it('should propagate repository errors when findAll fails', async () => {
    // Arrange
    const repositoryError = new Error('Database connection lost');
    vi.mocked(mockRepo.findAll).mockRejectedValue(repositoryError); // Simulate a repository error

    // Act & Assert
    await expect(getAllCategories.execute()).rejects.toThrow('Database connection lost');
    expect(mockRepo.findAll).toHaveBeenCalledOnce(); // Ensure the method was still called
  });

  it('should propagate generic errors from the repository', async () => {
    // Arrange
    const genericError = new Error('Unexpected repository error');
    vi.mocked(mockRepo.findAll).mockRejectedValue(genericError);

    // Act & Assert
    await expect(getAllCategories.execute()).rejects.toThrow(genericError);
    expect(mockRepo.findAll).toHaveBeenCalledOnce();
  });

  it('should only call the findAll method on the repository', async () => {
    // Arrange
    vi.mocked(mockRepo.findAll).mockResolvedValue(sampleCategories);

    // Act
    await getAllCategories.execute();

    // Assert
    expect(mockRepo.findAll).toHaveBeenCalledOnce();
    // Ensure no other repository methods were called
    expect(mockRepo.create).not.toHaveBeenCalled();
    expect(mockRepo.findById).not.toHaveBeenCalled();
    expect(mockRepo.update).not.toHaveBeenCalled();
    expect(mockRepo.delete).not.toHaveBeenCalled();
    expect(mockRepo.findByName).not.toHaveBeenCalled();
    expect(mockRepo.isInUse).not.toHaveBeenCalled();
  });
});