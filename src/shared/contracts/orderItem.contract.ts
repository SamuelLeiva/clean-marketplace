import { z } from 'zod'

const BaseOrderItemSchema = z.object({
  orderId: z.string().uuid(),
  productId: z.string().uuid(),
  quantity: z.number().int().nonnegative(),
  unitPrice: z.number().nonnegative(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
}).strict()

export const CreateOrderItemInput = BaseOrderItemSchema.omit({
  createdAt: true,
  updatedAt: true,
})

export const UpdateOrderItemInput = BaseOrderItemSchema.partial().omit({
  createdAt: true,
  updatedAt: true,
})

export const OrderItemResponse = BaseOrderItemSchema.extend({
  id: z.string().uuid(),
}).omit({
  createdAt: true,
  updatedAt: true,
})

export const OrderItemListResponse = z.array(OrderItemResponse)

export type CreateOrderItemInput = z.infer<typeof CreateOrderItemInput>
export type UpdateOrderItemInput = z.infer<typeof UpdateOrderItemInput>
export type OrderItemResponse = z.infer<typeof OrderItemResponse>
export type OrderItemListResponse = z.infer<typeof OrderItemListResponse>
