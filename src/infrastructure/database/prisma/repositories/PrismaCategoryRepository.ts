import { Category } from "@/core/entities";
import { CategoryRepository } from "@/core/ports";
import { CreateCategoryInput, UpdateCategoryInput } from "@/shared/contracts";
import { PrismaClient } from "@prisma/client";
import { normalizeCategory } from "../mappers/normalizeCategory";

const prisma = new PrismaClient()

export class PrismaCategoryRepository implements CategoryRepository {
    
    async create(input: CreateCategoryInput): Promise<Category> {
        const result = await prisma.category.create({
        data: input,
        });
        return normalizeCategory(result);
    }
    
    async findAll(): Promise<Category[]> {
        const results = await prisma.category.findMany();
        return results.map(normalizeCategory);
    }
    
    async findById(id: string): Promise<Category | null> {
        const result = await prisma.category.findUnique({ where: { id } });
        return result ? normalizeCategory(result) : null;
    }
    
    async update(id: string, input: UpdateCategoryInput): Promise<Category> {
        const result = await prisma.category.update({
        where: { id },
        data: input,
        });
        return normalizeCategory(result);
    }
    
    async delete(id: string): Promise<void> {
        await prisma.category.delete({ where: { id } });
    }
    
    async findByName(name: string): Promise<Category | null> {
        const result = await prisma.category.findFirst({ where: { name } });
        return result ? normalizeCategory(result) : null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async isInUse(id: string) {
    return false // temporalmente
  }

}