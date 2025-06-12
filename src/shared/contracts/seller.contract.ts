import { z } from 'zod'

const BaseSellerSchema = z.object({
  userId: z.string().uuid(),
  displayName: z
    .string()
    .min(10, 'DisplayName must be at least 10 characters')
    .max(100, 'DisplayName must be at most 100 characters'),
  shopName: z
    .string()
    .min(10, 'Shopname must be at least 10 characters')
    .max(100, 'Shopname must be at most 200 characters'),
  bio: z
    .string()
    .min(20, 'Bio must be at least 20 characters')
    .max(200, 'Bio must be at most 200 characters')
    .optional(),
  rating: z.number().min(0).max(5),
  totalSales: z.number().int().min(0),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
}).strict()

export const CreateSellerInput = BaseSellerSchema.omit({
  createdAt: true,
  updatedAt: true,
})

export const UpdateSellerInput = BaseSellerSchema.partial().omit({
  createdAt: true,
  updatedAt: true,
})

export const SellerResponse = BaseSellerSchema.extend({
  id: z.string().uuid(),
}).omit({
  createdAt: true,
  updatedAt: true,
})

export const SellerListResponse = z.array(SellerResponse)

export type CreateSellerInput = z.infer<typeof CreateSellerInput>
export type UpdateSellerInput = z.infer<typeof UpdateSellerInput>
export type SellerResponse = z.infer<typeof SellerResponse>
export type SellerListResponse = z.infer<typeof SellerListResponse>
