import { User } from "../entities"

export interface UserRepository {
  create(user: User): Promise<User>
  findById(id: string): Promise<User | null>
  findAll(): Promise<User[]>
  update(id: string, User: Partial<User>): Promise<User>
  delete(id: string): Promise<void>
}
