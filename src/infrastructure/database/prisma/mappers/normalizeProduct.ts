import { Product } from "@/core/entities";
import { Product as PrismaProduct } from "@prisma/client";

export function normalizeProduct(product: PrismaProduct): Product {
  return {
    ...product,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    description: product.description ?? undefined,
    // Ensure description is undefined if it is null
  };
}