import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'

// Dependencias de Infraestructura y Core
import { PrismaUserRepository } from '@/infrastructure/database/prisma/repositories/PrismaUserRepository'
import { SignUp } from '@/core/use-cases/auth/SignUp'

// Utilidades y Contratos Zod
import { successResponse } from '@/shared/utils/apiResponse'
import { handleError } from '@/shared/utils/handleError'
import { SignUpInput, UserResponse } from '@/shared/contracts/user.contract'

const prisma = new PrismaClient()
const userRepo = new PrismaUserRepository(prisma)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() // 1. Obtener el cuerpo de la solicitud

    // 2. Validar la entrada con Zod. Esto asegura que los datos sean correctos antes de pasarlos al caso de uso.
    const input: SignUpInput = SignUpInput.parse(body)

    // 3. Ejecutar el Caso de Uso de Registro.
    const useCase = new SignUp(userRepo)
    const newUser = await useCase.execute(input)

    // 4. Normalizar y validar la respuesta del usuario para el cliente con Zod.
    const validatedUserResponse: UserResponse = UserResponse.parse(newUser)

    // 5. Devolver una respuesta HTTP exitosa (201 Created).
    return successResponse(
      validatedUserResponse,
      'User registered successfully',
      201,
    )
  } catch (error) {
    // 6. Manejar cualquier error, convirtiéndolo en una respuesta HTTP adecuada.
    return handleError(error)
  }
}
