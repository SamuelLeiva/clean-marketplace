import { UserRepository } from '@/core/ports/UserRepository'
import { IJwtService } from '@/core/services/JwtService'
import { LoginInput } from '@/shared/contracts/user.contract'
import { User } from '@/core/entities'
import { InvalidCredentialsError } from '@/core/errors/auth'

export class Login {
  constructor(
    private userRepo: UserRepository,
    private jwtService: IJwtService,
  ) {}

  async execute(input: LoginInput): Promise<{ user: User; token: string }> {
    const { email, password } = input

    // --- CAMBIO AQUI ---
    // El repositorio ahora maneja la búsqueda de usuario y la comparación de contraseñas.
    const user = await this.userRepo.findUserByCredentials(email, password)

    if (!user) {
      throw new InvalidCredentialsError('Invalid email or password.')
    }

    // Generar JWT
    const token = this.jwtService.generateToken({ userId: user.id })

    return { user, token }
  }
}
