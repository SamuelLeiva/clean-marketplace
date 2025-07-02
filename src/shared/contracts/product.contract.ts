import { z } from 'zod'
import { PaginationMetaSchema } from '../constants/pagination'

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
    .positive('Price must be greater than 0')
    .finite(),
  stock: z
    .number()
    .min(0, 'Stock must be at least 0')
    .optional(),
  imageUrl: z.string().url('Invalid image URL').nullable().optional(),
  categoryId: z.string().uuid('Invalid category ID'),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
}).strict()

export const CreateProductInput = BaseProductSchema.omit({
  createdAt: true,
  updatedAt: true,
})

export const UpdateProductInput = BaseProductSchema.partial().omit({
  createdAt: true,
  updatedAt: true,
})

export const GetProductsFilterInput = z.object({
  // General search by name (partial match)
  name: z.string().optional(),

  // Filter by stock range
  minStock: z.number().int().min(0, 'Minimum stock must be non-negative').optional(),
  maxStock: z.number().int().min(0, 'Maximum stock must be non-negative').optional(),

  // Filter by price range
  minPrice: z.number().positive('Minimum price must be positive').optional(),
  maxPrice: z.number().positive('Maximum price must be positive').optional(),

  // Filter by category ID
  categoryId: z.string().uuid('Invalid category ID format').optional(),

  // Pagination parameters (these are technically part of the query, but often grouped with filters)
  page: z.number().int().positive('Page must be a positive integer').optional().default(1),
  limit: z.number().int().positive('Limit must be a positive integer').optional().default(10),
}).refine(data => {
    // Optional: Add custom validation for ranges (e.g., minPrice <= maxPrice)
    if (data.minPrice !== undefined && data.maxPrice !== undefined && data.minPrice > data.maxPrice) {
      throw new z.ZodError([
        {
          code: z.ZodIssueCode.custom,
          path: ['minPrice'],
          message: 'minPrice cannot be greater than maxPrice',
        },
      ]);
    }
    if (data.minStock !== undefined && data.maxStock !== undefined && data.minStock > data.maxStock) {
      throw new z.ZodError([
        {
          code: z.ZodIssueCode.custom,
          path: ['minStock'],
          message: 'minStock cannot be greater than maxStock',
        },
      ]);
    }
    return true;
}, {
  message: "Invalid filter range provided.",
  path: ["filterRange"]
});

export const ProductResponse = BaseProductSchema.extend({
  id: z.string().uuid(),
}).omit({
  createdAt: true,
  updatedAt: true,
})

// export const ProductListResponse = z.array(ProductResponse)

export const PaginatedProductListResponse = z.object({
  data: z.array(ProductResponse),
  meta: PaginationMetaSchema,
})

export type PaginatedProductListResponse = z.infer<typeof PaginatedProductListResponse>

export type CreateProductInput = z.infer<typeof CreateProductInput>
export type UpdateProductInput = z.infer<typeof UpdateProductInput>
export type ProductResponse = z.infer<typeof ProductResponse>
//export type ProductListResponse = z.infer<typeof ProductListResponse>

export type GetProductsFilterInput = z.infer<typeof GetProductsFilterInput>
