import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateCategory } from '@/core/use-cases/category'; // Adjust path as needed
import { CategoryRepository } from '@/core/ports'; // Adjust path as needed
import { Category } from '@/core/entities';
import { CreateCategoryInput } from '@/shared/contracts'; // Import the specific input type
import { CategoryAlreadyExistsError } from '@/core/errors/category'; // Ensure this error is defined

describe('CreateCategory Use Case', () => {
  let createCategory: CreateCategory;
  let mockRepo: CategoryRepository;

  // A constant ID and timestamps for the created category, as returned by the mock repository
  const mockGeneratedId = 'new-category-id-xyz';
  const mockCreatedAt = '2025-06-13T10:00:00.000Z';
  const mockUpdatedAt = '2025-06-13T10:00:00.000Z'; // Initially same as createdAt

  beforeEach(() => {
    mockRepo = {
      findByName: vi.fn(), // Mock for checking existing categories by name
      create: vi.fn(),     // Mock for creating the category
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      isInUse: vi.fn(),
    };

    createCategory = new CreateCategory(mockRepo);
    vi.clearAllMocks();
  });

// Successful Category Creation

  it('should create a new category when its name does not exist', async () => {
    // Arrange
    const input: CreateCategoryInput = {
      name: 'Electrónica',
      description: 'Dispositivos electrónicos y gadgets.',
    };

    // The full Category object that the repository mock will return after creation
    const createdCategory: Category = {
      id: mockGeneratedId,
      ...input,
      createdAt: mockCreatedAt,
      updatedAt: mockUpdatedAt,
    };

    // Mock: Category does not exist by name
    vi.mocked(mockRepo.findByName).mockResolvedValue(null);
    // Mock: Creation is successful and returns the full Category entity
    vi.mocked(mockRepo.create).mockResolvedValue(createdCategory);

    // Act
    const result = await createCategory.execute(input);

    // Assert
    expect(mockRepo.findByName).toHaveBeenCalledOnce();
    expect(mockRepo.findByName).toHaveBeenCalledWith(input.name);

    expect(mockRepo.create).toHaveBeenCalledOnce();
    // The use case passes the exact input to the repository's create method
    expect(mockRepo.create).toHaveBeenCalledWith(input);

    // The result should be the full Category entity returned by the repository
    expect(result).toEqual(createdCategory);
    expect(result.id).toBe(mockGeneratedId);
    expect(result.createdAt).toBe(mockCreatedAt);
    expect(result.updatedAt).toBe(mockUpdatedAt);
  });

  it('should create a category with minimum valid name and optional description omitted', async () => {
    // Arrange
    const input: CreateCategoryInput = {
      name: 'ABC', // Min 3 chars
      // Description is optional, so we omit it
    };
    const createdCategory: Category = {
      id: mockGeneratedId,
      ...input,
      description: undefined, // Explicitly undefined as it's optional
      createdAt: mockCreatedAt,
      updatedAt: mockUpdatedAt,
    };

    vi.mocked(mockRepo.findByName).mockResolvedValue(null);
    vi.mocked(mockRepo.create).mockResolvedValue(createdCategory);

    // Act
    const result = await createCategory.execute(input);

    // Assert
    expect(mockRepo.create).toHaveBeenCalledWith(input);
    expect(result.name).toBe(input.name);
    expect(result.description).toBeUndefined(); // Ensure description is undefined
  });

  it('should create a category with maximal valid name and description lengths', async () => {
    // Arrange
    const input: CreateCategoryInput = {
      name: 'A'.repeat(100), // Max 100 chars
      description: 'B'.repeat(500), // Max 500 chars
    };
    const createdCategory: Category = {
      id: mockGeneratedId,
      ...input,
      createdAt: mockCreatedAt,
      updatedAt: mockUpdatedAt,
    };

    vi.mocked(mockRepo.findByName).mockResolvedValue(null);
    vi.mocked(mockRepo.create).mockResolvedValue(createdCategory);

    // Act
    const result = await createCategory.execute(input);

    // Assert
    expect(mockRepo.create).toHaveBeenCalledWith(input);
    expect(result.name).toBe(input.name);
    expect(result.description).toBe(input.description);
  });

// Category Already Exists Scenarios

  it('should throw CategoryAlreadyExistsError when a category with the same name already exists', async () => {
    // Arrange
    const input: CreateCategoryInput = {
      name: 'Ropa',
      description: 'Vestimenta para todas las estaciones.',
    };

    const existingCategory: Category = {
      id: 'existing-cat-id',
      name: 'Ropa',
      description: 'Original description',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };

    // Mock: Category with this name already exists
    vi.mocked(mockRepo.findByName).mockResolvedValue(existingCategory);

    // Act & Assert
    await expect(createCategory.execute(input)).rejects.toThrow(CategoryAlreadyExistsError);
    await expect(createCategory.execute(input)).rejects.toThrow(`Category with name ${input.name} already exists`);
    expect(mockRepo.findByName).toHaveBeenCalled();
    expect(mockRepo.findByName).toHaveBeenCalledWith(input.name);
    expect(mockRepo.create).not.toHaveBeenCalled(); // Create should NOT be called if category exists
  });

  it('should not call create when a category with the same name already exists', async () => {
    // Arrange
    const input: CreateCategoryInput = {
      name: 'Duplicate Category',
      description: 'Another duplicate category.',
    };
    const existingCategory: Category = {
      id: 'dup-cat-id',
      ...input,
      createdAt: '2025-01-02T00:00:00.000Z',
      updatedAt: '2025-01-02T00:00:00.000Z',
    };

    vi.mocked(mockRepo.findByName).mockResolvedValue(existingCategory);

    // Act
    try {
      await createCategory.execute(input);
    } catch { // Catch error to allow assertions on mock calls, using _ for unused error variable
      // Intentionally empty
    }

    // Assert
    expect(mockRepo.findByName).toHaveBeenCalledOnce();
    expect(mockRepo.create).not.toHaveBeenCalled();
  });

// Repository Error Handling

  it('should propagate repository findByName errors', async () => {
    // Arrange
    const input: CreateCategoryInput = {
      name: 'Error Test Category',
      description: 'Description for error test.',
    };
    const repositoryError = new Error('Database connection failed during findByName');
    vi.mocked(mockRepo.findByName).mockRejectedValue(repositoryError);

    // Act & Assert
    await expect(createCategory.execute(input)).rejects.toThrow('Database connection failed during findByName');
    expect(mockRepo.findByName).toHaveBeenCalledOnce();
    expect(mockRepo.create).not.toHaveBeenCalled(); // Create should not be called
  });

  it('should propagate repository create errors', async () => {
    // Arrange
    const input: CreateCategoryInput = {
      name: 'Failed Create Category',
      description: 'Category that will fail on creation.',
    };
    const repositoryError = new Error('Failed to save category in database');
    vi.mocked(mockRepo.findByName).mockResolvedValue(null); // Category name is unique
    vi.mocked(mockRepo.create).mockRejectedValue(repositoryError); // Simulate creation failure

    // Act & Assert
    await expect(createCategory.execute(input)).rejects.toThrow('Failed to save category in database');
    expect(mockRepo.findByName).toHaveBeenCalledOnce();
    expect(mockRepo.create).toHaveBeenCalledOnce(); // Create was attempted and failed
    expect(mockRepo.create).toHaveBeenCalledWith(input);
  });

// Method Call Sequence

  it('should call repository methods in the correct order for successful creation', async () => {
    // Arrange
    const input: CreateCategoryInput = {
      name: 'Sequence Category',
      description: 'Testing call sequence.',
    };
    const createdCategory: Category = {
      id: mockGeneratedId,
      ...input,
      createdAt: mockCreatedAt,
      updatedAt: mockUpdatedAt,
    };

    vi.mocked(mockRepo.findByName).mockResolvedValue(null);
    vi.mocked(mockRepo.create).mockResolvedValue(createdCategory);

    // Act
    await createCategory.execute(input);

    // Assert
    const findByNameCall = vi.mocked(mockRepo.findByName).mock.calls[0];
    const createCall = vi.mocked(mockRepo.create).mock.calls[0];

    expect(findByNameCall).toBeDefined();
    expect(createCall).toBeDefined();

    // Verify findByName is called before create
    expect(vi.mocked(mockRepo.findByName)).toHaveBeenCalledBefore(vi.mocked(mockRepo.create));

    // Ensure only these methods were called
    expect(mockRepo.findByName).toHaveBeenCalledOnce();
    expect(mockRepo.create).toHaveBeenCalledOnce();
    expect(mockRepo.findById).not.toHaveBeenCalled();
    expect(mockRepo.findAll).not.toHaveBeenCalled();
    expect(mockRepo.update).not.toHaveBeenCalled();
    expect(mockRepo.delete).not.toHaveBeenCalled();
    expect(mockRepo.isInUse).not.toHaveBeenCalled();
  });

  it('should only call findByName if category already exists', async () => {
    // Arrange
    const input: CreateCategoryInput = {
      name: 'Only FindByName',
      description: 'Category for checking call order.',
    };
    const existingCategory: Category = {
      id: 'existing-id-call',
      ...input,
      createdAt: '2025-01-03T00:00:00.000Z',
      updatedAt: '2025-01-03T00:00:00.000Z',
    };

    vi.mocked(mockRepo.findByName).mockResolvedValue(existingCategory);

    // Act
    try {
      await createCategory.execute(input);
    } catch {
      // Catch error to allow assertions on mock calls
    }

    // Assert
    expect(mockRepo.findByName).toHaveBeenCalledOnce();
    expect(mockRepo.create).not.toHaveBeenCalled();
  });
});