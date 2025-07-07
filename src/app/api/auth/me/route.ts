import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'

// Dependencias de Infraestructura y Core
import { PrismaUserRepository } from '@/infrastructure/database/prisma/repositories/PrismaUserRepository'
import { JwtService } from '@/core/services/JwtService' // Para verificar el token
import { GetUserProfile } from '@/core/use-cases/auth/GetUserProfile'

// Utilidades y Contratos Zod
import { successResponse } from '@/shared/utils/apiResponse'
import { handleError } from '@/shared/utils/handleError'
import { UserResponse } from '@/shared/contracts/user.contract'
import { UnauthorizedError } from '@/core/errors/auth'

const prisma = new PrismaClient()
const userRepo = new PrismaUserRepository(prisma)
const jwtService = new JwtService()

export async function GET(req: NextRequest) {
  try {
    // 1. Extraer el token JWT del encabezado 'Authorization'.
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided or invalid token format.')
    }
    const token = authHeader.split(' ')[1]

    // 2. Verificar el token y extraer el 'userId'.
    let userId: string
    try {
      const decoded = jwtService.verifyToken(token) // Si el token es inválido/expirado, lanza error aquí.
      userId = decoded.userId
    } catch (jwtError) {
      // El JwtService ya lanza un UnauthorizedError, así que simplemente lo relanzamos.
      throw jwtError
    }

    // 3. Ejecutar el Caso de Uso para obtener el perfil del usuario.
    const useCase = new GetUserProfile(userRepo)
    const user = await useCase.execute(userId)

    // 4. Normalizar y validar la respuesta del usuario para el cliente con Zod.
    const validatedUserResponse: UserResponse = UserResponse.parse(user)

    // 5. Devolver una respuesta HTTP exitosa (200 OK).
    return successResponse(
      validatedUserResponse,
      'User profile retrieved successfully',
      200,
    )
  } catch (error) {
    // 6. Manejar errores (ej. token inválido -> 401 Unauthorized).
    return handleError(error)
  }
}
