import { CartRepository } from '@/core/ports/CartRepository'
import { PrismaCartWithItemsAndProducts } from '@/infrastructure/database/prisma/mappers/normalizeCart';

export class GetCartByUserId {
  constructor(private cartRepo: CartRepository) {}

  // El método execute ahora devolverá el tipo de Prisma
  async execute(userId: string): Promise<PrismaCartWithItemsAndProducts> { // <-- ¡CAMBIO CLAVE AQUÍ!
    // Intentar obtener el carrito existente del usuario en formato Prisma crudo
    const cart = await this.cartRepo.getRawCartByUserIdWithProducts(userId); // <-- ¡USAR EL NUEVO MÉTODO!

    // Si no existe, creamos uno nuevo automáticamente en formato Prisma crudo.
    if (!cart) {
      return await this.cartRepo.findOrCreateRawCartWithProducts(userId); // <-- USAR EL NUEVO MÉTODO
    }
    return cart;
  }
}
