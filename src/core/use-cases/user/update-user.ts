
import { User } from '@/core/entities/User'
import { UserNotFoundError } from '@/core/errors/user'
import { UserRepository } from '@/core/ports/UserRepository'
import { UpdateUserInput } from '@/shared/contracts'

export class UpdateUser {
  constructor(private repo: UserRepository) {}

  async execute(id: string, input: UpdateUserInput): Promise<User> {
    const User = await this.repo.findById(id)
    if (!User) {
      throw new UserNotFoundError(id)
    }

    //TODO: añadir validaciones en todos los use cases por si son llamados por tests u otros entornos

    return await this.repo.update(id, input)
  }
}
