import { CreateUserInput } from '@/shared/contracts'
import { UserAlreadyExistsError } from '@/core/errors/user'
import { UserRepository } from '@/core/ports'
import { User } from '@/core/entities'

export class CreateUser {
  constructor(private repo: UserRepository) {}

  async execute(input: CreateUserInput): Promise<User> {
    const existing = await this.repo.findByName(input.name)
    if (existing) {
      throw new UserAlreadyExistsError(input.name)
    }
    return await this.repo.create(input)
  }
}
