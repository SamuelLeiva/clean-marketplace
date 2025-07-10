import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'

// Repositorios
import { PrismaCartRepository } from '@/infrastructure/database/prisma/repositories/PrismaCartRepository'
import { PrismaProductRepository } from '@/infrastructure/database/prisma/repositories/PrismaProductRepository'

// Utilidades y Contratos
import { successResponse } from '@/shared/utils/apiResponse'
import { handleError } from '@/shared/utils/handleError'
import { AddToCartInput, CartResponse } from '@/shared/contracts/cart.contract'
import { AddToCart, GetCartByUserId } from '@/core/use-cases/cart'
import { getUserIdFromRequest } from '@/shared/utils/auth'
import { normalizeCartForResponse } from '@/infrastructure/database/prisma/mappers/normalizeCart'

const prisma = new PrismaClient()
const cartRepo = new PrismaCartRepository(prisma)
const productRepo = new PrismaProductRepository(prisma) // Necesario para AddToCart

export async function GET(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req) // autenticación del usuario

    const useCase = new GetCartByUserId(cartRepo)
    const cart = await useCase.execute(userId)

    const normalizedCartForResponse = normalizeCartForResponse(cart)

    // Validar y retornar la respuesta usando el contrato Zod
    const validatedCartResponse: CartResponse = CartResponse.parse(normalizedCartForResponse)

    return successResponse(
      validatedCartResponse,
      'Cart retrieved successfully',
      200,
    )
  } catch (error) {
    return handleError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req) // autenticación del usuario

    const body = await req.json()
    // Validar la entrada usando Zod
    const input: AddToCartInput = AddToCartInput.parse(body)

    const useCase = new AddToCart(cartRepo, productRepo)
    const cartItem = await useCase.execute(userId, input)

    // Puedes retornar el ítem de carrito actualizado o el carrito completo.
    // Por simplicidad, retornamos el ítem de carrito creado/actualizado.
    return successResponse(cartItem, 'Product added to cart successfully', 201)
  } catch (error) {
    return handleError(error)
  }
}
