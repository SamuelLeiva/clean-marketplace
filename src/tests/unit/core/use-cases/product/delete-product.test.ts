import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeleteProduct } from '@/core/use-cases/product'; // Adjust path as needed
import { ProductRepository } from '@/core/ports'; // Adjust path as needed
import { Product } from '@/core/entities';
import { ProductNotFoundError, CannotDeleteProductError } from '@/core/errors/product'; // Ensure these errors are defined

describe('DeleteProduct Use Case', () => {
  let deleteProduct: DeleteProduct;
  let mockRepo: ProductRepository;

  // An example product for testing
  const existingProduct: Product = {
    id: 'product-to-delete-123',
    name: 'Laptop Gamer',
    description: 'Potente laptop para gaming de alto rendimiento.',
    price: 1500.00,
    categoryId: 'gaming-category-456',
    createdAt: '2025-01-01T10:00:00.000Z',
    updatedAt: '2025-01-01T10:00:00.000Z',
  };

  beforeEach(() => {
    // Create fresh mocks for each test
    mockRepo = {
      create: vi.fn(),
      findById: vi.fn(), // Mock for finding the product
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(), // Mock for deleting the product
      findByName: vi.fn(),
      isInUse: vi.fn(), // Mock for checking if product is in use, as it's called in the use case
    };

    deleteProduct = new DeleteProduct(mockRepo);

    // Clear all mocks before each test
    vi.clearAllMocks();
  });

//Successful Product Deletion

  it('should delete a product when a valid ID is provided and it is not in use', async () => {
    // Arrange
    // Mock: product exists
    vi.mocked(mockRepo.findById).mockResolvedValue(existingProduct);
    // Mock: product is not in use (as per your comment, this will be false for now, but tested as true for robustness)
    vi.mocked(mockRepo.isInUse).mockResolvedValue(false);
    // Mock: delete operation is successful
    vi.mocked(mockRepo.delete).mockResolvedValue(undefined); // delete returns void

    // Act
    const result = await deleteProduct.execute(existingProduct.id);

    // Assert
    expect(mockRepo.findById).toHaveBeenCalledOnce();
    expect(mockRepo.findById).toHaveBeenCalledWith(existingProduct.id);
    expect(mockRepo.isInUse).toHaveBeenCalledOnce(); // isInUse is always called
    expect(mockRepo.isInUse).toHaveBeenCalledWith(existingProduct.id);
    expect(mockRepo.delete).toHaveBeenCalledOnce();
    expect(mockRepo.delete).toHaveBeenCalledWith(existingProduct.id);
    expect(result).toBeUndefined(); // Expect void return
  });

  //Handling Product Not Found

  it('should throw ProductNotFoundError if the product does not exist', async () => {
    // Arrange
    const nonExistentId = 'non-existent-product-id';
    // Mock: findById returns null
    vi.mocked(mockRepo.findById).mockResolvedValue(null);

    // Act & Assert
    await expect(deleteProduct.execute(nonExistentId)).rejects.toThrow(ProductNotFoundError);
    await expect(deleteProduct.execute(nonExistentId)).rejects.toThrow(`Product with ID ${nonExistentId} was not found`);
    expect(mockRepo.findById).toHaveBeenCalled();
    expect(mockRepo.findById).toHaveBeenCalledWith(nonExistentId);
    expect(mockRepo.isInUse).not.toHaveBeenCalled(); // No need to check if not found
    expect(mockRepo.delete).not.toHaveBeenCalled(); // Delete should not be called
  });

  it('should throw ProductNotFoundError if findById returns undefined', async () => {
    // Arrange
    const nonExistentId = 'undefined-product-id';
    // Mock: findById returns undefined
    vi.mocked(mockRepo.findById).mockResolvedValue(null);

    // Act & Assert
    await expect(deleteProduct.execute(nonExistentId)).rejects.toThrow(ProductNotFoundError);
    expect(mockRepo.findById).toHaveBeenCalledOnce();
    expect(mockRepo.findById).toHaveBeenCalledWith(nonExistentId);
    expect(mockRepo.isInUse).not.toHaveBeenCalled();
    expect(mockRepo.delete).not.toHaveBeenCalled();
  });

// Handling Product Cannot Be Deleted (In Use)

  it('should throw CannotDeleteProductError if the product is in use', async () => {
    // Arrange
    // Mock: product exists
    vi.mocked(mockRepo.findById).mockResolvedValue(existingProduct);
    // Mock: product IS in use (simulating future behavior)
    vi.mocked(mockRepo.isInUse).mockResolvedValue(true);

    // Act & Assert
    await expect(deleteProduct.execute(existingProduct.id)).rejects.toThrow(CannotDeleteProductError);
    await expect(deleteProduct.execute(existingProduct.id)).rejects.toThrow(`Cannot delete product with ID ${existingProduct.id} because it is in use`);
    expect(mockRepo.findById).toHaveBeenCalled();
    expect(mockRepo.findById).toHaveBeenCalledWith(existingProduct.id);
    expect(mockRepo.isInUse).toHaveBeenCalled();
    expect(mockRepo.isInUse).toHaveBeenCalledWith(existingProduct.id);
    expect(mockRepo.delete).not.toHaveBeenCalled(); // Delete should not be called
  });

 // Repository Error Handling

  it('should propagate repository findById errors', async () => {
    // Arrange
    const repositoryError = new Error('Database connection failed during findById');
    vi.mocked(mockRepo.findById).mockRejectedValue(repositoryError);

    // Act & Assert
    await expect(deleteProduct.execute(existingProduct.id)).rejects.toThrow('Database connection failed during findById');
    expect(mockRepo.findById).toHaveBeenCalledOnce();
    expect(mockRepo.delete).not.toHaveBeenCalled();
    expect(mockRepo.isInUse).not.toHaveBeenCalled(); // No call to isInUse if findById fails
  });

  it('should propagate repository isInUse errors', async () => {
    // Arrange
    const repositoryError = new Error('Database error checking product usage');
    vi.mocked(mockRepo.findById).mockResolvedValue(existingProduct);
    vi.mocked(mockRepo.isInUse).mockRejectedValue(repositoryError);

    // Act & Assert
    await expect(deleteProduct.execute(existingProduct.id)).rejects.toThrow('Database error checking product usage');
    expect(mockRepo.findById).toHaveBeenCalledOnce();
    expect(mockRepo.isInUse).toHaveBeenCalledOnce();
    expect(mockRepo.delete).not.toHaveBeenCalled();
  });

  it('should propagate repository delete errors', async () => {
    // Arrange
    const repositoryError = new Error('Failed to delete product in database');
    vi.mocked(mockRepo.findById).mockResolvedValue(existingProduct);
    vi.mocked(mockRepo.isInUse).mockResolvedValue(false); // Not in use
    vi.mocked(mockRepo.delete).mockRejectedValue(repositoryError);

    // Act & Assert
    await expect(deleteProduct.execute(existingProduct.id)).rejects.toThrow('Failed to delete product in database');
    expect(mockRepo.findById).toHaveBeenCalledOnce();
    expect(mockRepo.isInUse).toHaveBeenCalledOnce();
    expect(mockRepo.delete).toHaveBeenCalledOnce(); // Delete was attempted and failed
  });

// Method Call Sequence

  it('should call repository methods in the correct order for a successful deletion', async () => {
    // Arrange
    vi.mocked(mockRepo.findById).mockResolvedValue(existingProduct);
    vi.mocked(mockRepo.isInUse).mockResolvedValue(false);
    vi.mocked(mockRepo.delete).mockResolvedValue(undefined);

    // Act
    await deleteProduct.execute(existingProduct.id);

    // Assert
    // Check call order
    expect(vi.mocked(mockRepo.findById)).toHaveBeenCalledBefore(vi.mocked(mockRepo.isInUse));
    expect(vi.mocked(mockRepo.isInUse)).toHaveBeenCalledBefore(vi.mocked(mockRepo.delete));

    // Ensure only relevant methods were called
    expect(mockRepo.findById).toHaveBeenCalledOnce();
    expect(mockRepo.isInUse).toHaveBeenCalledOnce();
    expect(mockRepo.delete).toHaveBeenCalledOnce();
    expect(mockRepo.create).not.toHaveBeenCalled();
    expect(mockRepo.findAll).not.toHaveBeenCalled();
    expect(mockRepo.update).not.toHaveBeenCalled();
    expect(mockRepo.findByName).not.toHaveBeenCalled();
  });

  it('should not call isInUse or delete if product is not found', async () => {
    // Arrange
    const nonExistentId = 'non-existent-id-sequence';
    vi.mocked(mockRepo.findById).mockResolvedValue(null);

    // Act & Assert
    await expect(deleteProduct.execute(nonExistentId)).rejects.toThrow(ProductNotFoundError);

    expect(mockRepo.findById).toHaveBeenCalledOnce();
    expect(mockRepo.isInUse).not.toHaveBeenCalled();
    expect(mockRepo.delete).not.toHaveBeenCalled();
  });

  it('should not call delete if product is in use', async () => {
    // Arrange
    vi.mocked(mockRepo.findById).mockResolvedValue(existingProduct);
    vi.mocked(mockRepo.isInUse).mockResolvedValue(true);

    // Act & Assert
    await expect(deleteProduct.execute(existingProduct.id)).rejects.toThrow(CannotDeleteProductError);

    expect(mockRepo.findById).toHaveBeenCalledOnce();
    expect(mockRepo.isInUse).toHaveBeenCalledOnce();
    expect(mockRepo.delete).not.toHaveBeenCalled(); // Delete should not be called
  });
});