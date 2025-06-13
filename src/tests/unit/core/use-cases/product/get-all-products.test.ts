import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetAllProducts } from '@/core/use-cases/product'; // Adjust path as needed
import { ProductRepository } from '@/core/ports'; // Adjust path as needed
import { Product } from '@/core/entities';
// No need to import ProductListResponse from contracts for unit testing the use case,
// as the use case itself returns `Product[]`, which is compatible.

describe('GetAllProducts Use Case', () => {
  let getAllProducts: GetAllProducts;
  let mockRepo: ProductRepository;

  // Sample products for testing
  const sampleProducts: Product[] = [
    {
      id: 'prod1',
      name: 'Laptop X1 Carbon',
      description: 'Ultra-portable business laptop.',
      price: 1500.00,
      categoryId: 'cat-laptops',
      createdAt: '2025-01-01T10:00:00.000Z',
      updatedAt: '2025-01-01T10:00:00.000Z',
    },
    {
      id: 'prod2',
      name: 'Mechanical Keyboard RGB',
      description: 'Gaming mechanical keyboard with customizable RGB lighting.',
      price: 120.50,
      categoryId: 'cat-peripherals',
      createdAt: '2025-01-05T12:30:00.000Z',
      updatedAt: '2025-01-05T12:30:00.000Z',
    },
    {
      id: 'prod3',
      name: 'Wireless Mouse Ergo',
      description: 'Ergonomic wireless mouse for long hours of work.',
      price: 45.99,
      categoryId: 'cat-peripherals',
      createdAt: '2025-01-10T09:15:00.000Z',
      updatedAt: '2025-01-10T09:15:00.000Z',
    },
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

    getAllProducts = new GetAllProducts(mockRepo);

    // Clear all mocks before each test
    vi.clearAllMocks();
  });

 //Successful Product Retrieval

  it('should return an array of all products when products exist', async () => {
    // Arrange
    vi.mocked(mockRepo.findAll).mockResolvedValue(sampleProducts);

    // Act
    const result = await getAllProducts.execute();

    // Assert
    expect(mockRepo.findAll).toHaveBeenCalledOnce(); // Ensure the repository method was called
    expect(result).toEqual(sampleProducts); // Ensure the returned data matches the mock
    expect(result).toBeInstanceOf(Array); // Ensure it's an array
    expect(result.length).toBe(sampleProducts.length); // Check array length
    // You can iterate and check properties of individual products if needed
    result.forEach((product, index) => {
      expect(product.id).toBe(sampleProducts[index].id);
      expect(product.name).toBe(sampleProducts[index].name);
      expect(product.price).toBe(sampleProducts[index].price);
      // ... check other properties
    });
  });

  it('should return an empty array when no products exist in the repository', async () => {
    // Arrange
    vi.mocked(mockRepo.findAll).mockResolvedValue([]); // Mock an empty array

    // Act
    const result = await getAllProducts.execute();

    // Assert
    expect(mockRepo.findAll).toHaveBeenCalledOnce();
    expect(result).toEqual([]); // Expect an empty array
    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBe(0);
  });

  it('should return products with all expected properties (including dates)', async () => {
    // Arrange
    vi.mocked(mockRepo.findAll).mockResolvedValue([sampleProducts[0]]); // Test with a single product

    // Act
    const [product] = await getAllProducts.execute();

    // Assert
    expect(product).toBeDefined();
    expect(product.id).toBe(sampleProducts[0].id);
    expect(product.name).toBe(sampleProducts[0].name);
    expect(product.description).toBe(sampleProducts[0].description);
    expect(product.price).toBe(sampleProducts[0].price);
    expect(product.categoryId).toBe(sampleProducts[0].categoryId);
    expect(product.createdAt).toBe(sampleProducts[0].createdAt);
    expect(product.updatedAt).toBe(sampleProducts[0].updatedAt);
    // Ensure no extra properties are returned
    expect(Object.keys(product)).toEqual(Object.keys(sampleProducts[0]));
  });

  // Repository Error Handling

  it('should propagate repository errors when findAll fails', async () => {
    // Arrange
    const repositoryError = new Error('Database connection lost');
    vi.mocked(mockRepo.findAll).mockRejectedValue(repositoryError); // Simulate a repository error

    // Act & Assert
    await expect(getAllProducts.execute()).rejects.toThrow('Database connection lost');
    expect(mockRepo.findAll).toHaveBeenCalledOnce(); // Ensure the method was still called
  });

  it('should propagate generic errors from the repository', async () => {
    // Arrange
    const genericError = new Error('Unexpected repository error on product list retrieval');
    vi.mocked(mockRepo.findAll).mockRejectedValue(genericError);

    // Act & Assert
    await expect(getAllProducts.execute()).rejects.toThrow(genericError);
    expect(mockRepo.findAll).toHaveBeenCalledOnce();
  });

  // Method Call Sequence

  it('should only call the findAll method on the repository', async () => {
    // Arrange
    vi.mocked(mockRepo.findAll).mockResolvedValue(sampleProducts);

    // Act
    await getAllProducts.execute();

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