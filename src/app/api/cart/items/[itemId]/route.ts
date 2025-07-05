import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Repositorios
import { PrismaCartRepository } from '@/infrastructure/database/prisma/repositories/PrismaCartRepository';
import { PrismaProductRepository } from '@/infrastructure/database/prisma/repositories/PrismaProductRepository'; // Necesario para UpdateCartItemQuantity

// Casos de Uso
import { UpdateCartItemQuantity } from '@/core/use-cases/cart/UpdateCartItemQuantity';
import { RemoveFromCart } from '@/core/use-cases/cart/RemoveFromCart';

// Utilidades y Contratos
import { successResponse } from '@/shared/utils/apiResponse';
import { handleError } from '@/shared/utils/handleError';
import { UpdateCartItemInput } from '@/shared/contracts/cart.contract';

const prisma = new PrismaClient();
const cartRepo = new PrismaCartRepository(prisma);
const productRepo = new PrismaProductRepository(prisma); // Necesario para UpdateCartItemQuantity

// --- MOCK USER ID (¡REEMPLAZAR CON AUTENTICACIÓN REAL!) ---
const MOCK_USER_ID = 'your-mock-user-id'; // <--- ¡CAMBIAR ESTO!

/**
 * PUT /api/cart/items/:itemId
 * Actualiza la cantidad de un ítem específico en el carrito.
 */
export async function PUT(
  req: NextRequest,
  context: { params: { itemId: string } }, // Next.js 13/14 usa `params` directamente aquí
) {
  try {
    const userId = MOCK_USER_ID; // Aquí integrarías tu lógica de autenticación

    if (!userId) {
      return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
    }

    const { itemId } = context.params;
    if (!itemId) {
      return NextResponse.json({ success: false, message: 'Cart item ID is required.' }, { status: 400 });
    }

    const body = await req.json();
    const input: UpdateCartItemInput = UpdateCartItemInput.parse(body);

    const useCase = new UpdateCartItemQuantity(cartRepo, productRepo); // Pasar productRepo
    const updatedCartItem = await useCase.execute(itemId, input);

    return successResponse(updatedCartItem, 'Cart item quantity updated successfully', 200);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * DELETE /api/cart/items/:itemId
 * Elimina un ítem específico del carrito.
 */
export async function DELETE(
  req: NextRequest,
  context: { params: { itemId: string } }, // Next.js 13/14 usa `params` directamente aquí
) {
  try {
    const userId = MOCK_USER_ID; // Aquí integrarías tu lógica de autenticación

    if (!userId) {
      return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
    }

    const { itemId } = context.params;
    if (!itemId) {
      return NextResponse.json({ success: false, message: 'Cart item ID is required.' }, { status: 400 });
    }

    const useCase = new RemoveFromCart(cartRepo);
    await useCase.execute(itemId);

    return successResponse(null, 'Cart item removed successfully', 204); // 204 No Content para eliminación exitosa
  } catch (error) {
    return handleError(error);
  }
}