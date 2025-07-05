import { Cart, CartItem } from '@/core/entities'
import {
  Prisma,
} from '@prisma/client'
import { normalizeProduct } from './normalizeProduct'

export type PrismaCartWithItemsAndProducts = Prisma.CartGetPayload<{
  include: {
    cartItems: {
      include: {
        product: true // incluye el product para cada cartItem
      }
    }
  }
}>

export type PrismaCartItemWithProduct = Prisma.CartItemGetPayload<{
  include: { product: true }
}>

// Funciones de normalización

export function normalizeCartItem(cartItem: PrismaCartItemWithProduct): CartItem {
  // Normaliza el producto si está presente
  const normalizedProduct = cartItem.product ? normalizeProduct(cartItem.product) : undefined;

  return {
    ...cartItem, // Copia las propiedades directas (id, cartId, productId, quantity, priceAtTimeOfAddition)
    createdAt: cartItem.createdAt.toISOString(), // Convierte Date a ISO string
    updatedAt: cartItem.updatedAt.toISOString(), // Convierte Date a ISO string
    product: normalizedProduct, // Asigna el producto normalizado
  };
}

export function normalizeCart(cart: PrismaCartWithItemsAndProducts): Cart {
  return {
    ...cart, // Copia las propiedades directas (id, userId, status)
    status: cart.status as 'active' | 'abandoned' | 'converted', // Asegura que el status sea del tipo correcto
    createdAt: cart.createdAt.toISOString(), // Convierte Date a ISO string
    updatedAt: cart.updatedAt.toISOString(), // Convierte Date a ISO string
    cartItems: cart.cartItems ? cart.cartItems.map(item => normalizeCartItem(item)) : [],
  };
}
