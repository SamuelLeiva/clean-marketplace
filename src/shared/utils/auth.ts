import { UnauthorizedError } from '@/core/errors/auth'
import { JwtService } from '@/core/services/JwtService'
import { NextRequest } from 'next/server'

const jwtService = new JwtService()

export function getUserIdFromRequest(req: NextRequest): string {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError(
      'Authentication required: Bearer token not provided or invalid format.',
    )
  }

  const token = authHeader.split(' ')[1]

  let userId: string
  try {
    const decoded = jwtService.verifyToken(token)
    userId = decoded.userId
  } catch (error) {
    // JwtService.verifyToken ya lanza UnauthorizedError, lo re-lanzamos tal cual.
    throw error
  }

  if (!userId) {
    throw new UnauthorizedError(
      'Authentication failed: User ID not found in token.',
    )
  }

  return userId
}
