import { z } from "zod";

const BasePaymentSchema = z.object({
    orderId: z.string().uuid(),
    method: z.enum(['credit-card', 'deposit', 'digital-wallet', 'paypal']),
    amount: z.number().nonnegative(),
    status: z.enum(['pending', 'success', 'failed']),
    createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
}).strict()

export const CreatePaymentInput = BasePaymentSchema.omit({
  createdAt: true,
  updatedAt: true,
})

export const UpdatePaymentInput = BasePaymentSchema.partial().omit({
  createdAt: true,
  updatedAt: true,
})

export const PaymentResponse = BasePaymentSchema.extend({
  id: z.string().uuid(),
}).omit({
  createdAt: true,
  updatedAt: true,
})

export const PaymentListResponse = z.array(PaymentResponse)

export type CreatePaymentInput = z.infer<typeof CreatePaymentInput>
export type UpdatePaymentInput = z.infer<typeof UpdatePaymentInput>
export type PaymentResponse = z.infer<typeof PaymentResponse>
export type PaymentListResponse = z.infer<typeof PaymentListResponse>