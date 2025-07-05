import { Cart, CartItem } from '@/core/entities'
import { CartRepository } from '@/core/ports'
import { PrismaClient } from '@prisma/client'
import {
  normalizeCart,
  normalizeCartItem,
  PrismaCartItemWithProduct,
  PrismaCartWithItemsAndProducts,
} from '../mappers/normalizeCart'

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
    cartItemId: string,
    quantity: number,
  ): Promise<CartItem> {
    const updatedItem = (await this.prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity: quantity },
      include: { product: true }, // Incluye el producto para la normalización
    })) as PrismaCartItemWithProduct
    return normalizeCartItem(updatedItem)
  }

  async removeCartItem(cartItemId: string): Promise<void> {
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
