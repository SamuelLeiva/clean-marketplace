import { UserNotFoundError } from '@/core/errors/user'
import { User } from '../../entities/User'
import { UserRepository } from '../../ports/UserRepository'

export class GetUserById {
  constructor(private repo: UserRepository) {}

  async execute(id: string): Promise<User | null> {
    const User = await this.repo.findById(id)
    if (!User) {
      throw new UserNotFoundError(id)
    }
    return User
  }
}
