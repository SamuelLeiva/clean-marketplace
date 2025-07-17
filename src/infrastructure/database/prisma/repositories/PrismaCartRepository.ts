import { Cart, CartItem } from '@/core/entities'
import { CartRepository } from '@/core/ports'
import { PrismaClient } from '@prisma/client'
import {
  normalizeCart,
  normalizeCartItem,
  PrismaCartItemWithProduct,
  PrismaCartWithItemsAndProducts,
} from '../mappers/normalizeCart'
import {
  CartItemNotFoundError,
  InvalidCartOperationError,
  UnauthorizedCartAccessError,
} from '@/core/errors/cart'

export class PrismaCartRepository implements CartRepository {
  private prisma: PrismaClient

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient || new PrismaClient()
  }

  async findOrCreateCart(userId: string): Promise<Cart> {
    const cart = (await this.prisma.cart.upsert({
      where: { userId: userId },
      update: {}, // Si ya existe, no hace nada por defecto
      create: { userId: userId },
      // IMPORTANTE: Incluir las relaciones para la normalización
      include: {
        cartItems: {
          include: {
            product: true,
          },
        },
      },
    })) as PrismaCartWithItemsAndProducts // Castear al tipo que normalizeCart espera

    return normalizeCart(cart)
  }

  async getCartById(cartId: string): Promise<Cart | null> {
    const cart = (await this.prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        cartItems: {
          include: {
            product: true,
          },
        },
      },
    })) as PrismaCartWithItemsAndProducts | null

    return cart ? normalizeCart(cart) : null
  }

  async getCartByUserId(userId: string): Promise<Cart | null> {
    const cart = (await this.prisma.cart.findUnique({
      where: { userId: userId },
      include: {
        cartItems: {
          include: {
            product: true,
          },
        },
      },
    })) as PrismaCartWithItemsAndProducts | null

    return cart ? normalizeCart(cart) : null
  }

  async addProductToCart(
    cartId: string,
    productId: string,
    quantity: number,
    price: number,
  ): Promise<CartItem> {
    const existingCartItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cartId,
          productId: productId,
        },
      },
    })

    let cartItem: PrismaCartItemWithProduct // Tipo explícito para la normalización
    if (existingCartItem) {
      cartItem = (await this.prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + quantity },
        include: { product: true }, // Incluye el producto para la normalización
      })) as PrismaCartItemWithProduct
    } else {
      cartItem = (await this.prisma.cartItem.create({
        data: {
          cartId: cartId,
          productId: productId,
          quantity: quantity,
          priceAtTimeOfAddition: price,
        },
        include: { product: true }, // Incluye el producto para la normalización
      })) as PrismaCartItemWithProduct
    }
    return normalizeCartItem(cartItem)
  }

  async updateCartItemQuantity(
    userId: string,
    cartItemId: string,
    quantity: number,
  ): Promise<CartItem> {
    // 1. Encontrar el cartItem y su carrito asociado para verificar la propiedad
    const prismaCartItem = await this.prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: {
        cart: {
          select: {
            userId: true,
          },
        },
        product: true, // Incluir el producto para la conversión a dominio
      },
    })

    if (!prismaCartItem) {
      throw new CartItemNotFoundError(cartItemId)
    }

    // ✅ Verificar si el item pertenece al usuario correcto
    if (prismaCartItem.cart?.userId !== userId) {
      throw new UnauthorizedCartAccessError(
        `Cart item ${cartItemId} does not belong to user ${userId}.`,
      )
    }

    // Si la cantidad es 0 o menos, podrías decidir eliminar el ítem aquí o dejarlo en el Use Case.
    // Si lo haces aquí, considera que ya tendrías un método removeCartItem que haría lo mismo.
    if (quantity <= 0) {
      await this.removeCartItem(userId, cartItemId) // Reutilizar el método de eliminación
      // Puedes devolver el CartItem que fue eliminado con cantidad 0, o null, o un tipo especial.
      // Para simplicidad, podríamos simplemente re-obtener el carrito después y devolverlo si tu UC lo espera.
      // O hacer que el UC que llama a esto maneje el caso de cantidad 0.
      // Por ahora, lanzaremos un error si no lo quieres permitir con 0.
      throw new InvalidCartOperationError(
        'Quantity must be at least 1. Use remove operation for 0 quantity.',
      )
    }

    // 2. Actualizar la cantidad
    const updatedPrismaCartItem = await this.prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity, updatedAt: new Date() },
      include: { product: true },
    })

    return normalizeCartItem(updatedPrismaCartItem)
  }

  async removeCartItem(userId: string, cartItemId: string): Promise<void> {
    // 1. Encontrar el cartItem y su carrito asociado para verificar la propiedad
    const prismaCartItem = await this.prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: {
        cart: {
          select: {
            userId: true,
          },
        },
      },
    })

    if (!prismaCartItem) {
      throw new CartItemNotFoundError(cartItemId)
    }

    // ✅ Verificar si el item pertenece al usuario correcto
    if (prismaCartItem.cart?.userId !== userId) {
      throw new UnauthorizedCartAccessError(
        `Cart item ${cartItemId} does not belong to user ${userId}.`,
      )
    }

    // 2. Eliminar el item
    await this.prisma.cartItem.delete({
      where: { id: cartItemId },
    })
  }

  async clearCart(cartId: string): Promise<void> {
    await this.prisma.cartItem.deleteMany({
      where: { cartId: cartId },
    })
  }

  async getCartItemById(cartItemId: string): Promise<CartItem | null> {
    const cartItem = (await this.prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { product: true }, // Incluye el producto para la normalización
    })) as PrismaCartItemWithProduct | null
    return cartItem ? normalizeCartItem(cartItem) : null
  }
}
