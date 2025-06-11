import { UserNotFoundError } from '@/core/errors/user'
import { User } from '@/core/entities'
import { UserRepository } from '@/core/ports'

export class GetUserById {
  constructor(private repo: UserRepository) {}

  async execute(id: string): Promise<User | null> {
    const user = await this.repo.findById(id)
    if (!user) {
      throw new UserNotFoundError(id)
    }
    return user
  }
}
