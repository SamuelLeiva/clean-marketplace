import { z } from 'zod';
import { ProductResponse } from './product.contract';

// --- Input Schemas ---
export const AddToCartInput = z.object({
  productId: z.string().uuid('Invalid product ID format.'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1.'),
}).strict();

export const UpdateCartItemInput = z.object({
  quantity: z.number().int().min(1, 'Quantity must be at least 1.'),
}).strict();

// --- Response Schemas ---
// Represents a single item in the cart
export const CartItemResponse = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  // You might want to include partial product data directly here for convenience
  product: ProductResponse.partial().pick({
    id: true,
    name: true,
    price: true,
    imageUrl: true,
  }),
  quantity: z.number().int().min(1),
  priceAtTimeOfAddition: z.number().positive(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
}).strict();

// Represents the entire cart
export const CartResponse = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  status: z.enum(['active', 'abandoned', 'converted']),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  cartItems: z.array(CartItemResponse), // A list of items in the cart
}).strict();

// --- Infer Types ---
export type AddToCartInput = z.infer<typeof AddToCartInput>;
export type UpdateCartItemInput = z.infer<typeof UpdateCartItemInput>;
export type CartItemResponse = z.infer<typeof CartItemResponse>;
export type CartResponse = z.infer<typeof CartResponse>;