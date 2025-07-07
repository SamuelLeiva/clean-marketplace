import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'

// Dependencias de Infraestructura y Core
import { PrismaUserRepository } from '@/infrastructure/database/prisma/repositories/PrismaUserRepository'
import { JwtService } from '@/core/services/JwtService'
import { Login } from '@/core/use-cases/auth/Login'

// Utilidades y Contratos Zod
import { successResponse } from '@/shared/utils/apiResponse'
import { handleError } from '@/shared/utils/handleError'
import { LoginInput, LoginResponse } from '@/shared/contracts/user.contract'

const prisma = new PrismaClient()
const userRepo = new PrismaUserRepository(prisma)
const jwtService = new JwtService()

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() // 1. Obtener el cuerpo de la solicitud

    // 2. Validar la entrada con Zod.
    const input: LoginInput = LoginInput.parse(body)

    // 3. Ejecutar el Caso de Uso de Login.
    const useCase = new Login(userRepo, jwtService)
    const { user, token } = await useCase.execute(input)

    // 4. Normalizar y validar la respuesta de Login con Zod.
    const validatedLoginResponse: LoginResponse = LoginResponse.parse({
      user,
      token,
    })

    // 5. Devolver una respuesta HTTP exitosa (200 OK) con el token y los datos del usuario.
    return successResponse(validatedLoginResponse, 'Login successful', 200)
  } catch (error) {
    // 6. Manejar errores.
    return handleError(error)
  }
}
