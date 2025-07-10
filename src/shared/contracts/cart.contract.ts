import { z } from 'zod'

export const AddToCartInput = z
  .object({
    productId: z.string().uuid('Invalid product ID format.'),
    quantity: z.number().int().min(1, 'Quantity must be at least 1.'),
  })
  .strict()

export const UpdateCartItemInput = z
  .object({
    quantity: z.number().int().min(1, 'Quantity must be at least 1.'),
  })
  .strict()

// --- Response Schemas ---
// Define el esquema para el producto tal como aparecerá dentro de CartItemResponse.
export const ProductInCartItemResponse = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
    price: z.number(),
    imageUrl: z.string().url().nullable().optional(), // Es opcional en tu entidad, así que debe serlo aquí también
    // Omitimos intencionalmente 'description', 'stock', 'categoryId', 'createdAt', 'updatedAt'
  })
  .strict() // El .strict() aquí asegura que solo estos campos sean válidos.

// Ajuste de CartItemResponse
export const CartItemResponse = z
  .object({
    id: z.string().uuid(),
    productId: z.string().uuid(),
    product: ProductInCartItemResponse,
    quantity: z.number().int().min(1),
    priceAtTimeOfAddition: z.number().positive(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .strict()

// 3. CartResponse
export const CartResponse = z
  .object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    status: z.enum(['active', 'abandoned', 'converted']), // valores del enum de Prisma
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    cartItems: z.array(CartItemResponse), // A list of items in the cart
  })
  .strict()

// --- Infer Types ---
export type AddToCartInput = z.infer<typeof AddToCartInput>
export type UpdateCartItemInput = z.infer<typeof UpdateCartItemInput>
export type ProductInCartItemResponse = z.infer<
  typeof ProductInCartItemResponse
>
export type CartItemResponse = z.infer<typeof CartItemResponse>
export type CartResponse = z.infer<typeof CartResponse>
