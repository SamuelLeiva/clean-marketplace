import { User } from '../entities'

export interface UserRepository {
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  // TODO: tal vez colocar un DTO para create
  create(user: { name?: string; email: string; hashedPassword: string }): Promise<User>
  findUserByCredentials(email: string, password: string): Promise<User | null>;
}
