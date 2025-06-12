import { z } from 'zod'

const BaseCartItemSchema = z.object({
  userId: z.string().uuid(),
  productId: z.string().uuid(),
  quantity: z.number().min(1).default(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
}).strict()

export const CreateCartItemInput = BaseCartItemSchema.omit({
  createdAt: true,
  updatedAt: true,
})

export const UpdateCartItemInput = BaseCartItemSchema.partial().omit({
  createdAt: true,
  updatedAt: true,
})

export const CartItemResponse = BaseCartItemSchema.extend({
  id: z.string().uuid(),
}).omit({
  createdAt: true,
  updatedAt: true,
})

export const CartItemListResponse = z.array(CartItemResponse)

//Tipos inferidos
export type CreateCartItemInput = z.infer<typeof CreateCartItemInput>
export type UpdateCartItemInput = z.infer<typeof UpdateCartItemInput>
export type CartItemResponse = z.infer<typeof CartItemResponse>
export type CartItemListResponse = z.infer<typeof CartItemListResponse>
