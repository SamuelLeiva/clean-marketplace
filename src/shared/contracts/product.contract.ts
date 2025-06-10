import { z } from 'zod'

const BaseProductSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must be at most 100 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Name must be at most 500 characters'),
  price: z
    .number({
      required_error: 'Price is required',
      invalid_type_error: 'Price must be a number',
    })
    .positive('Price must be greater than 0'),
  categoryId: z.string().uuid('Invalid category ID'),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

// Entrada para crear un producto
export const CreateProductInput = BaseProductSchema.omit({
  createdAt: true,
  updatedAt: true,
})

// Entrada para actualizar un producto (campos opcionales)
export const UpdateProductInput = BaseProductSchema.partial().omit({
  createdAt: true,
  updatedAt: true,
})

// Salida esperada (una respuesta de producto)
export const ProductResponse = BaseProductSchema.extend({
  id: z.string().uuid(),
}).omit({
  createdAt: true,
  updatedAt: true,
})

// Salida esperada (lista de productos)
export const ProductListResponse = z.array(ProductResponse)

// Tipos inferidos
export type CreateProductInput = z.infer<typeof CreateProductInput>
export type UpdateProductInput = z.infer<typeof UpdateProductInput>
export type ProductResponse = z.infer<typeof ProductResponse>
export type ProductListResponse = z.infer<typeof ProductListResponse>
