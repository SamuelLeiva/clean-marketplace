import { describe, it, expect, vi } from "vitest";
import { CreateProduct } from "@/core/use-cases/product";
import { v4 as uuidv4 } from "uuid";
import { ProductRepository } from "@/core/ports/ProductRepository";
import { CreateProductInput } from "@/shared/contracts/product.contract";
import { Product } from "@/core/entities/Product";

describe("CreateProductUseCase", () => {
  it("should create a valid product", async () => {
    const mockRepo: ProductRepository = {
        create: vi.fn(
            async (input: CreateProductInput): Promise<Product> => ({
                ...input,
                id: uuidv4()
            })
        ),
        findById: vi.fn(),
        findAll: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        findByName: vi.fn(),
        isInUse: vi.fn(),
    };

    const useCase = new CreateProduct(mockRepo);

    const input: CreateProductInput = {
      name: "Libro",
      description: "Una historia genial",
      price: 20,
      categoryId: uuidv4(),
    };

    const result = await useCase.execute(input);

    expect(result).toHaveProperty("id"); //se podría agregar más cosas al mock
    expect(result.name).toBe("Libro");
    expect(mockRepo.create).toHaveBeenCalledWith(expect.objectContaining(input));
  });
});