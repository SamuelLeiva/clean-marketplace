import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetCategoryById } from '@/core/use-cases/category'; // Ajusta la ruta si es necesario
import { CategoryRepository } from '@/core/ports'; // Ajusta la ruta si es necesario
import { Category } from '@/core/entities';
import { CategoryNotFoundError } from '@/core/errors/category'; // Asegúrate de que este error esté definido

describe('GetCategoryById Use Case', () => {
  let getCategoryById: GetCategoryById;
  let mockRepo: CategoryRepository;

  // Una categoría de ejemplo para las pruebas
  const existingCategory: Category = {
    id: 'category-id-123',
    name: 'Ropa',
    description: 'Vestimenta y accesorios de moda.',
  };

  beforeEach(() => {
    // Crea mocks frescos para cada test
    mockRepo = {
      create: vi.fn(),
      findById: vi.fn(), // Mock para encontrar la categoría por ID
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findByName: vi.fn(),
      isInUse: vi.fn(),
    };

    getCategoryById = new GetCategoryById(mockRepo);

    // Limpia todos los mocks antes de cada test
    vi.clearAllMocks();
  });


  it('should return the category when a valid ID is provided and the category exists', async () => {
    // Arrange
    vi.mocked(mockRepo.findById).mockResolvedValue(existingCategory);

    // Act
    const result = await getCategoryById.execute(existingCategory.id);

    // Assert
    expect(mockRepo.findById).toHaveBeenCalledOnce(); // Verifica que el método del repositorio fue llamado
    expect(mockRepo.findById).toHaveBeenCalledWith(existingCategory.id); // Verifica que fue llamado con el ID correcto
    expect(result).toEqual(existingCategory); // Asegura que los datos devueltos coincidan
    expect(result).toBeInstanceOf(Object); // Asegura que el resultado es un objeto
    expect(result!.id).toBe(existingCategory.id);
    expect(result!.name).toBe(existingCategory.name);
    expect(result!.description).toBe(existingCategory.description);
  });

  it('should return a category even if its description is undefined', async () => {
    // Arrange
    const categoryWithoutDescription: Category = {
      id: 'cat-no-desc-456',
      name: 'Software',
      description: undefined, // Descripción indefinida
    };
    vi.mocked(mockRepo.findById).mockResolvedValue(categoryWithoutDescription);

    // Act
    const result = await getCategoryById.execute(categoryWithoutDescription.id);

    // Assert
    expect(mockRepo.findById).toHaveBeenCalledOnce();
    expect(result).toEqual(categoryWithoutDescription);
    expect(result!.description).toBeUndefined();
  });

  it('should throw CategoryNotFoundError if the category with the provided ID does not exist', async () => {
    // Arrange
    const nonExistentId = 'non-existent-category-id-789';
    // Mock: findById devuelve null, indicando que no se encontró la categoría
    vi.mocked(mockRepo.findById).mockResolvedValue(null);

    // Act & Assert
    await expect(getCategoryById.execute(nonExistentId)).rejects.toThrow(CategoryNotFoundError);
    await expect(getCategoryById.execute(nonExistentId)).rejects.toThrow(`Category with ID ${nonExistentId} was not found`);
    expect(mockRepo.findById).toHaveBeenCalled();
    expect(mockRepo.findById).toHaveBeenCalledWith(nonExistentId);
  });

  it('should throw CategoryNotFoundError if findById returns undefined', async () => {
    // Arrange
    const nonExistentId = 'another-non-existent-id-000';
    // Mock: findById devuelve undefined, lo que también significa que no se encontró
    vi.mocked(mockRepo.findById).mockResolvedValue(null);

    // Act & Assert
    await expect(getCategoryById.execute(nonExistentId)).rejects.toThrow(CategoryNotFoundError);
    await expect(getCategoryById.execute(nonExistentId)).rejects.toThrow(`Category with ID ${nonExistentId} was not found`);
    expect(mockRepo.findById).toHaveBeenCalled();
    expect(mockRepo.findById).toHaveBeenCalledWith(nonExistentId);
  });

  it('should propagate repository errors when findById fails', async () => {
    // Arrange
    const repositoryError = new Error('Database connection failed during findById');
    vi.mocked(mockRepo.findById).mockRejectedValue(repositoryError); // Simula un error del repositorio

    // Act & Assert
    await expect(getCategoryById.execute(existingCategory.id)).rejects.toThrow('Database connection failed during findById');
    expect(mockRepo.findById).toHaveBeenCalledOnce(); // Verifica que el método fue llamado
    expect(mockRepo.findById).toHaveBeenCalledWith(existingCategory.id);
  });

  it('should propagate generic errors from the repository', async () => {
    // Arrange
    const genericError = new Error('Unexpected repository error on read operation');
    vi.mocked(mockRepo.findById).mockRejectedValue(genericError);

    // Act & Assert
    await expect(getCategoryById.execute(existingCategory.id)).rejects.toThrow(genericError);
    expect(mockRepo.findById).toHaveBeenCalledOnce();
  });

  it('should only call the findById method on the repository', async () => {
    // Arrange
    vi.mocked(mockRepo.findById).mockResolvedValue(existingCategory);

    // Act
    await getCategoryById.execute(existingCategory.id);

    // Assert
    expect(mockRepo.findById).toHaveBeenCalledOnce(); // Solo findById debe ser llamado
    // Asegura que ningún otro método del repositorio fue llamado
    expect(mockRepo.create).not.toHaveBeenCalled();
    expect(mockRepo.findAll).not.toHaveBeenCalled();
    expect(mockRepo.update).not.toHaveBeenCalled();
    expect(mockRepo.delete).not.toHaveBeenCalled();
    expect(mockRepo.findByName).not.toHaveBeenCalled();
    expect(mockRepo.isInUse).not.toHaveBeenCalled();
  });
});