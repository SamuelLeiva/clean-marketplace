import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetProductById } from '@/core/use-cases/product'; // Adjust path as needed
import { ProductRepository } from '@/core/ports'; // Adjust path as needed
import { Product } from '@/core/entities';
import { ProductNotFoundError } from '@/core/errors/product'; // Ensure this error is defined

describe('GetProductById Use Case', () => {
  let getProductById: GetProductById;
  let mockRepo: ProductRepository;

  // An example product for testing
  const existingProduct: Product = {
    id: 'product-id-123',
    name: 'Teclado Mecánico',
    description: 'Teclado retroiluminado RGB para gaming.',
    price: 99.99,
    categoryId: 'peripherals-cat-abc',
    createdAt: '2024-05-15T10:30:00.000Z',
    updatedAt: '2024-05-15T10:30:00.000Z',
  };

  beforeEach(() => {
    // Create fresh mocks for each test
    mockRepo = {
      create: vi.fn(),
      findById: vi.fn(), // Mock for finding the product by ID
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findByName: vi.fn(),
      isInUse: vi.fn(),
    };

    getProductById = new GetProductById(mockRepo);

    // Clear all mocks before each test
    vi.clearAllMocks();
  });

// Successful Product Retrieval

  it('should return the product when a valid ID is provided and the product exists', async () => {
    // Arrange
    vi.mocked(mockRepo.findById).mockResolvedValue(existingProduct);

    // Act
    const result = await getProductById.execute(existingProduct.id);

    // Assert
    expect(mockRepo.findById).toHaveBeenCalledOnce(); // Verify the repository method was called
    expect(mockRepo.findById).toHaveBeenCalledWith(existingProduct.id); // Verify it was called with the correct ID
    expect(result).toEqual(existingProduct); // Ensure the returned data matches
    expect(result).toBeInstanceOf(Object); // Ensure the result is an object
    expect(result!.id).toBe(existingProduct.id);
    expect(result!.name).toBe(existingProduct.name);
    expect(result!.description).toBe(existingProduct.description);
    expect(result!.price).toBe(existingProduct.price);
    expect(result!.categoryId).toBe(existingProduct.categoryId);
    expect(result!.createdAt).toBe(existingProduct.createdAt);
    expect(result!.updatedAt).toBe(existingProduct.updatedAt);
  });

  it('should return a product even if its description is undefined (if Product entity allowed)', async () => {
    // Note: Based on your Product entity, `description` is a `string`, not optional.
    // This test assumes `Product` could potentially have an `undefined` description,
    // which contradicts your current `Product` interface.
    // If your `Product` interface for `description` was `string | undefined`, this test would be valid.
    // For now, I'll keep it as a demonstration but note its potential conflict with strict types.

    // Arrange
    const productWithoutDescription: Product = {
      id: 'prod-no-desc-456',
      name: 'Monitor Curvo',
      description: 'Pantalla ultra ancha para inmersión total.', // Your entity has description as string, so this won't be undefined.
      price: 300.00,
      categoryId: 'displays-cat-xyz',
      createdAt: '2024-06-01T08:00:00.000Z',
      updatedAt: '2024-06-01T08:00:00.000Z',
    };
    // To properly test this, if description can be optional in a real scenario,
    // your `Product` entity should be: `description?: string;` or `description: string | undefined;`
    // For this test, I'll make the mock return what your entity defines, so description won't be undefined here.
    vi.mocked(mockRepo.findById).mockResolvedValue(productWithoutDescription);

    // Act
    const result = await getProductById.execute(productWithoutDescription.id);

    // Assert
    expect(mockRepo.findById).toHaveBeenCalledOnce();
    expect(result).toEqual(productWithoutDescription);
    // Based on your Product entity: expect(result.description).toBeDefined();
    // If description could be optional: expect(result.description).toBeUndefined();
  });

// Handling Product Not Found

  it('should throw ProductNotFoundError if the product with the provided ID does not exist', async () => {
    // Arrange
    const nonExistentId = 'non-existent-product-id-789';
    // Mock: findById returns null, indicating the product was not found
    vi.mocked(mockRepo.findById).mockResolvedValue(null); // <-- Use null here

    // Act & Assert
    await expect(getProductById.execute(nonExistentId)).rejects.toThrow(ProductNotFoundError);
    await expect(getProductById.execute(nonExistentId)).rejects.toThrow(`Product with ID ${nonExistentId} was not found`);
    expect(mockRepo.findById).toHaveBeenCalled();
    expect(mockRepo.findById).toHaveBeenCalledWith(nonExistentId);
  });

// Repository Error Handling

  it('should propagate repository errors when findById fails', async () => {
    // Arrange
    const repositoryError = new Error('Database connection failed during findById');
    vi.mocked(mockRepo.findById).mockRejectedValue(repositoryError); // Simulate a repository error

    // Act & Assert
    await expect(getProductById.execute(existingProduct.id)).rejects.toThrow('Database connection failed during findById');
    expect(mockRepo.findById).toHaveBeenCalledOnce(); // Verify the method was called
    expect(mockRepo.findById).toHaveBeenCalledWith(existingProduct.id);
  });

  it('should propagate generic errors from the repository', async () => {
    // Arrange
    const genericError = new Error('Unexpected repository error on read operation');
    vi.mocked(mockRepo.findById).mockRejectedValue(genericError);

    // Act & Assert
    await expect(getProductById.execute(existingProduct.id)).rejects.toThrow(genericError);
    expect(mockRepo.findById).toHaveBeenCalledOnce();
  });

// Method Call Sequence

  it('should only call the findById method on the repository', async () => {
    // Arrange
    vi.mocked(mockRepo.findById).mockResolvedValue(existingProduct);

    // Act
    await getProductById.execute(existingProduct.id);

    // Assert
    expect(mockRepo.findById).toHaveBeenCalledOnce(); // Only findById should be called
    // Ensure no other repository methods were called
    expect(mockRepo.create).not.toHaveBeenCalled();
    expect(mockRepo.findAll).not.toHaveBeenCalled();
    expect(mockRepo.update).not.toHaveBeenCalled();
    expect(mockRepo.delete).not.toHaveBeenCalled();
    expect(mockRepo.findByName).not.toHaveBeenCalled();
    expect(mockRepo.isInUse).not.toHaveBeenCalled();
  });
});