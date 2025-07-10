import { Product } from "@/core/entities";
import { ProductInCartItemResponse } from "@/shared/contracts/cart.contract";
import { Product as PrismaProduct } from "@prisma/client";

export function normalizeProduct(product: PrismaProduct): Product {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    stock: product.stock,
    imageUrl: product.imageUrl ?? undefined,
    categoryId: product.categoryId,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}

// NUEVA FUNCIÓN PARA EL CONTEXTO DEL CARRITO
// Esta función mapea solo las propiedades necesarias para `ProductInCartItemResponse`
export function normalizeProductForCartItemResponse(product: PrismaProduct): ProductInCartItemResponse {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    imageUrl: product.imageUrl ?? undefined, // Es opcional en tu esquema
    // Asegúrate de NO incluir 'stock', 'categoryId', 'createdAt', 'updatedAt' aquí.
  };
}