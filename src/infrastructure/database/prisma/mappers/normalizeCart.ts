import { Cart, CartItem } from '@/core/entities'; // Tus entidades de dominio (puede que las necesites para otros casos de uso)
import {
  Prisma
} from '@prisma/client';

// Importa los esquemas de respuesta Zod del contrato de carrito
import { CartResponse, CartItemResponse } from '@/shared/contracts/cart.contract';

// Importa la función de normalización de producto específica para el carrito
import { normalizeProduct, normalizeProductForCartItemResponse } from './normalizeProduct'; // <-- Asegúrate de que esta ruta sea correcta

// Tipos de carga útil de Prisma para incluir relaciones
export type PrismaCartWithItemsAndProducts = Prisma.CartGetPayload<{
  include: {
    cartItems: {
      include: {
        product: true; // Incluye el producto para cada cartItem
      };
    };
  };
}>;

export type PrismaCartItemWithProduct = Prisma.CartItemGetPayload<{
  include: { product: true };
}>;

// --- NORMALIZADORES PARA LA RESPUESTA DE LA API (Coinciden con los esquemas Zod de contrato) ---

export function normalizeCartItemForResponse(
  cartItem: PrismaCartItemWithProduct
): CartItemResponse {
  // Aquí usamos el normalizador de producto específico para la respuesta del carrito
  const normalizedProduct = cartItem.product
    ? normalizeProductForCartItemResponse(cartItem.product)
    : undefined; // Podrías querer lanzar un error aquí si un producto siempre debería estar presente

  return {
    id: cartItem.id,
    productId: cartItem.productId,
    quantity: cartItem.quantity,
    priceAtTimeOfAddition: cartItem.priceAtTimeOfAddition,
    createdAt: cartItem.createdAt.toISOString(),
    updatedAt: cartItem.updatedAt.toISOString(),
    product: normalizedProduct!, // Asegúrate de que 'product' no sea undefined si el esquema Zod lo espera como NO opcional
    // *** IMPORTANTE: NO INCLUIR 'cartId' aquí si tu CartItemResponse del contrato no lo tiene. ***
    // Tu CartItemResponse no tiene cartId, por lo tanto, no lo retornamos aquí.
  };
}

export function normalizeCartForResponse(
  cart: PrismaCartWithItemsAndProducts
): CartResponse {
  return {
    id: cart.id,
    userId: cart.userId,
    status: cart.status.toLowerCase() as 'active' | 'abandoned' | 'converted', // Coincide con tu Zod enum de status
    createdAt: cart.createdAt.toISOString(),
    updatedAt: cart.updatedAt.toISOString(),
    // Mapea los ítems del carrito usando el normalizador específico para la respuesta
    cartItems: cart.cartItems
      ? cart.cartItems.map((item) => normalizeCartItemForResponse(item))
      : [],
  };
}


// --- NORMALIZADORES PARA ENTIDADES DE DOMINIO (Si los usas internamente en tu capa de Core) ---
// Estas funciones mapean de Prisma a tus entidades de dominio definidas en '@/core/entities'.
// Pueden contener más campos que las respuestas de la API.
// Si no las usas en tu capa de Core, puedes eliminarlas.

export function normalizeCartItem(cartItem: PrismaCartItemWithProduct): CartItem {
  // Aquí puedes usar tu `normalizeProduct` original si tu entidad `CartItem` (de dominio)
  // espera el producto completo.
  const normalizedProduct = cartItem.product ? normalizeProduct(cartItem.product) : undefined;
  return {
    id: cartItem.id,
    cartId: cartItem.cartId, // La entidad de dominio `CartItem` sí puede tener `cartId`
    productId: cartItem.productId,
    quantity: cartItem.quantity,
    priceAtTimeOfAddition: cartItem.priceAtTimeOfAddition,
    createdAt: cartItem.createdAt.toISOString(),
    updatedAt: cartItem.updatedAt.toISOString(),
    product: normalizedProduct,
  };
}

export function normalizeCart(cart: PrismaCartWithItemsAndProducts): Cart {
  return {
    id: cart.id,
    userId: cart.userId,
    status: cart.status.toLowerCase() as 'active' | 'abandoned' | 'converted', // Ajusta según tu enum interno si usa minúsculas
    createdAt: cart.createdAt.toISOString(),
    updatedAt: cart.updatedAt.toISOString(),
    cartItems: cart.cartItems ? cart.cartItems.map(item => normalizeCartItem(item)) : [],
  };
}