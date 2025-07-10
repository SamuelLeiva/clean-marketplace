import { z } from 'zod'
// No necesitamos ProductResponse directamente aquí para el item del carrito,
// ya que definiremos su propia versión simplificada.
// import { ProductResponse } from './product.contract'; // <-- Podrías eliminar esta línea si no se usa en otro lugar de este archivo.

// --- Input Schemas (sin cambios, parecen estar bien) ---
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

// 1. **NUEVO ESQUEMA:** Define el esquema para el producto tal como aparecerá dentro de CartItemResponse.
// Este esquema solo incluye los campos que realmente quieres en la respuesta del carrito.
export const ProductInCartItemResponse = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
    price: z.number(),
    imageUrl: z.string().url().optional(), // Es opcional en tu entidad, así que debe serlo aquí también
    // Omitimos intencionalmente 'description', 'stock', 'categoryId', 'createdAt', 'updatedAt'
  })
  .strict() // El .strict() aquí asegura que solo estos campos sean válidos.

// 2. Ajuste de CartItemResponse
export const CartItemResponse = z
  .object({
    id: z.string().uuid(),
    productId: z.string().uuid(),
    // Usa el nuevo esquema de producto simplificado
    product: ProductInCartItemResponse, // <--- CAMBIO CLAVE AQUÍ
    quantity: z.number().int().min(1),
    priceAtTimeOfAddition: z.number().positive(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    // ¡OJO! No incluyas 'cartId' aquí si no lo quieres en la respuesta del cliente,
    // ya que tu mapper `normalizeCartItemForResponse` tampoco lo retornará.
  })
  .strict() // El .strict() aquí es importante.

// 3. CartResponse (parece estar bien, solo asegúrate de que 'status' coincida con tu enum de Prisma)
export const CartResponse = z
  .object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    status: z.enum(['active', 'abandoned', 'converted']), // Asegúrate que estos valores coinciden EXACTAMENTE con tu enum de Prisma
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
> // <-- Nuevo tipo
export type CartItemResponse = z.infer<typeof CartItemResponse>
export type CartResponse = z.infer<typeof CartResponse>
