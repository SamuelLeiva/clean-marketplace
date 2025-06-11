import { User } from '../entities'

export interface UserRepository {
  create(user: User): Promise<User>
  findById(id: string): Promise<User | null>
  findAll(): Promise<User[]>
  update(id: string, User: Partial<User>): Promise<User>
  delete(id: string): Promise<void>

  // Métodos adicionales al CRUD clásico
  findByName(name: string): Promise<User | null>
  isInUse(id: string): Promise<boolean>
}
