// Asegúrate de que estas variables de entorno existan o tengan un valor por defecto seguro.

import { UnauthorizedError } from '@/core/errors/auth'
import { IJwtService } from '@/core/ports'
import jwt from 'jsonwebtoken'

// Añadimos una aserción de tipo para JWT_SECRET
const JWT_SECRET: string =
  process.env.JWT_SECRET ||
  'your_jwt_secret_key_please_change_this_in_production'
// Aseguramos que JWT_EXPIRES_IN sea siempre un string
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '1d'

//Validación adicional para JWT_SECRET en producción
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error(
    'FATAL ERROR: JWT_SECRET is not defined in production environment.',
  )
}

export class JwtService implements IJwtService {
  constructor() {}

  generateToken(payload: { userId: string }): string {
    // Aplicamos una aserción de tipo al objeto de opciones completo
    return jwt.sign(
      payload,
      JWT_SECRET as string,
      { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions,
    )
  }

  verifyToken(token: string): { userId: string } {
    try {
      const decoded = jwt.verify(token, JWT_SECRET as string) as {
        userId: string
      }
      return decoded
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Token expired.')
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('Invalid token.')
      }
      throw new UnauthorizedError('Authentication failed.')
    }
  }
}
