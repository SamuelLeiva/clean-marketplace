import { PrismaClient } from '@prisma/client'
import { UserRepository } from '@/core/ports/UserRepository'
import { User } from '@/core/entities'
import { normalizeUser } from '../mappers/normalizeUser' // Tu normalizador de usuario
import bcrypt from 'bcryptjs'

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

  async create(userData: {
    name?: string
    email: string
    hashedPassword: string
  }): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: userData.hashedPassword, // Almacena el hash, no la contraseña plana
      },
    })
    return normalizeUser(user)
  }

  async findUserByCredentials(
    email: string,
    password: string,
  ): Promise<User | null> {
    // 1. Encontrar el usuario EN BRUTO (incluyendo la contraseña hasheada)
    const userWithHash = await this.prisma.user.findUnique({ where: { email } })

    // 2. Si no se encuentra el usuario, o la contraseña no coincide, retornar null
    if (
      !userWithHash ||
      !(await bcrypt.compare(password, userWithHash.password))
    ) {
      return null
    }

    // 3. Si las credenciales son válidas, normalizar y retornar la entidad User
    return normalizeUser(userWithHash)
  }
}
