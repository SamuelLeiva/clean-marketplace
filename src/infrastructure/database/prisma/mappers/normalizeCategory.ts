import { Category } from "@/core/entities";
import { Category as PrismaCategory } from "@prisma/client";

export function normalizeCategory(category: PrismaCategory): Category {
  return {
    ...category,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
    description: category.description ?? undefined,
    // Ensure description is undefined if it is null
  };
}