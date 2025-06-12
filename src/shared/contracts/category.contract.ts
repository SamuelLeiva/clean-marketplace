import { z } from 'zod'

const BaseCategorySchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must be at most 100 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Name must be at most 500 characters')
    .optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
}).strict()

export const CreateCategoryInput = BaseCategorySchema.omit({
  createdAt: true,
  updatedAt: true,
})

export const UpdateCategoryInput = BaseCategorySchema.partial().omit({
  createdAt: true,
  updatedAt: true,
})

export const CategoryResponse = BaseCategorySchema.extend({
  id: z.string().uuid(),
}).omit({
  createdAt: true,
  updatedAt: true,
})

export const CategoryListResponse = z.array(CategoryResponse)

//Tipos inferidos
export type CreateCategoryInput = z.infer<typeof CreateCategoryInput>
export type UpdateCategoryInput = z.infer<typeof UpdateCategoryInput>
export type CategoryResponse = z.infer<typeof CategoryResponse>
export type CategoryListResponse = z.infer<typeof CategoryListResponse>
