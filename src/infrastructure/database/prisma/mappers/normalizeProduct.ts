import { Product } from "@/core/entities";
import { Product as PrismaProduct } from "@prisma/client";

export function normalizeProduct(product: PrismaProduct): Product {
  return {
    ...product,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    description: product.description ?? undefined,
    imageUrl: product.imageUrl ?? undefined,
    // Ensure description and imageUrl are undefined if they are null
  };
}