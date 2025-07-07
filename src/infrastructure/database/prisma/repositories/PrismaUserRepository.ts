import { PrismaClient } from '@prisma/client'
import { UserRepository } from '@/core/ports/UserRepository'
import { User } from '@/core/entities'
import { normalizeUser } from '../mappers/normalizeUser' // Tu normalizador de usuario
import { SignUpInput } from '@/shared/contracts'

export class PrismaUserRepository implements UserRepository {
  private prisma: PrismaClient

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient || new PrismaClient()
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } })
    return user ? normalizeUser(user) : null
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } })
    return user ? normalizeUser(user) : null
  }

  async create(input: SignUpInput): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        password: input.hashedPassword, // Almacena el hash, no la contraseña plana
      },
    })
    return normalizeUser(user)
  }
}
