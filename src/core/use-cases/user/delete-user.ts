import { CannotDeleteUserError, UserNotFoundError } from '@/core/errors/user'
import { UserRepository } from '@/core/ports/UserRepository'

export class DeleteUser {
  constructor(private repo: UserRepository) {}

  async execute(id: string): Promise<void> {
    const user = await this.repo.findById(id)
    if (!user) {
      throw new UserNotFoundError(id)
    }

    // por ahora esto siempre retornará false
    const isInUse = await this.repo.isInUse(id) // Ejemplo: en un pedido, carrito...
    if (isInUse) {
      throw new CannotDeleteUserError(id)
    }

    await this.repo.delete(id)
  }
}
