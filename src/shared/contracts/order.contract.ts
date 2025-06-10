import { z } from 'zod'

const BaseOrderSchema = z.object({
  total: z.number().nonnegative(),
  status: z.enum(['pending', 'paid', 'shipped', 'cancelled']),
  buyerId: z.string().uuid(),
  paymentId: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const CreateOrderInput = BaseOrderSchema.omit({
  createdAt: true,
  updatedAt: true,
})

export const UpdateOrderInput = BaseOrderSchema.partial().omit({
  createdAt: true,
  updatedAt: true,
})

export const OrderResponse = BaseOrderSchema.extend({
  id: z.string().uuid(),
}).omit({
  createdAt: true,
  updatedAt: true,
})

export const OrderListResponse = z.array(OrderResponse)

export type CreateOrderInput = z.infer<typeof CreateOrderInput>
export type UpdateOrderInput = z.infer<typeof UpdateOrderInput>
export type OrderResponse = z.infer<typeof OrderResponse>
export type OrderListResponse = z.infer<typeof OrderListResponse>
