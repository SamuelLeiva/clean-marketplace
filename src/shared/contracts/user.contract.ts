import { z } from 'zod';

// Esquema base para los datos de usuario
const BaseUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be at most 50 characters').optional(),
  email: z.string().email('Invalid email address'),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
}).strict();


// Esquema para la entrada de registro (signup)
export const SignUpInput = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be at most 50 characters').optional(),
  email: z.string().email('Invalid email address'),
  hashedPassword: z.string().min(8, 'Password must be at least 8 characters').max(100, 'Password must be at most 100 characters'),
}).strict();

// Esquema para la entrada de login
export const LoginInput = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'), // No se valida el largo aquí, solo que exista
}).strict();

// Esquema para la respuesta de un usuario (sin password ni timestamps para el cliente)
export const UserResponse = BaseUserSchema.omit({
  createdAt: true,
  updatedAt: true,
}).extend({
  id: z.string().uuid(),
}).strict();

// Esquema para la respuesta de login (usuario + token)
export const LoginResponse = z.object({
  user: UserResponse,
  token: z.string(), // El JWT o token de sesión
}).strict();

// Inferred types
export type SignUpInput = z.infer<typeof SignUpInput>;
export type LoginInput = z.infer<typeof LoginInput>;
export type UserResponse = z.infer<typeof UserResponse>;
export type LoginResponse = z.infer<typeof LoginResponse>;