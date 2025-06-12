import { z } from 'zod'

const BaseUserSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must be at most 100 characters'),
  lastName: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must be at most 100 characters'),
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
}).strict()

export const CreateUserInput = BaseUserSchema.omit({
  createdAt: true,
  updatedAt: true,
})

export const UpdateUserInput = BaseUserSchema.partial().omit({
  createdAt: true,
  updatedAt: true,
})

export const UserResponse = BaseUserSchema.extend({
  id: z.string().uuid(),
}).omit({
  createdAt: true,
  updatedAt: true,
})

export const UserListResponse = z.array(UserResponse)

export type CreateUserInput = z.infer<typeof CreateUserInput>
export type UpdateUserInput = z.infer<typeof UpdateUserInput>
export type UserResponse = z.infer<typeof UserResponse>
export type UserListResponse = z.infer<typeof UserListResponse>
