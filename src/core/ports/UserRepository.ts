import { CreateUserInput, UpdateUserInput } from '@/shared/contracts'
import { User } from '../entities'

export interface UserRepository {
  create(user: CreateUserInput): Promise<User>
  findById(id: string): Promise<User | null>
  findAll(): Promise<User[]>
  update(id: string, user: UpdateUserInput): Promise<User>
  delete(id: string): Promise<void>

  // Métodos adicionales al CRUD clásico
  findByName(name: string): Promise<User | null>
  isInUse(id: string): Promise<boolean>
}
