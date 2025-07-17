import { UserRepository } from '@/core/ports/UserRepository'
import { User } from '@/core/entities'
import { UnauthorizedError } from '@/core/errors/auth'

// no se inyecta el jwtservice porque el usuario ya viene verificado al hacer login
export class GetUserProfile {
  constructor(private userRepo: UserRepository) {}

  async execute(userId: string): Promise<User> {
    // 1. Buscar el usuario por su ID.
    const user = await this.userRepo.findById(userId)

    // 2. Regla de Negocio: Si el ID del token no corresponde a un usuario existente, es un error.
    if (!user) {
      throw new UnauthorizedError(
        'User profile not found or invalid user ID in token.',
      )
    }

    return user
  }
}
