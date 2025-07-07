import { User } from '../entities'
import { SignUpInput } from '@/shared/contracts';

export interface UserRepository {
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  create(user: SignUpInput): Promise<User>

  findUserByCredentials(email: string, password: string): Promise<User | null>;
}
