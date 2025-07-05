import { Cart } from '@/core/entities';
import { CartRepository } from '@/core/ports/CartRepository';

export class GetCartByUserId {
  constructor(private cartRepo: CartRepository) {}

  async execute(userId: string): Promise<Cart> {
    // Intentar obtener el carrito existente del usuario
    const cart = await this.cartRepo.getCartByUserId(userId);

    // Si no existe, creamos uno nuevo automáticamente.
    // Esto es una decisión de diseño: se podría optar por lanzar un CartNotFoundError si se prefiere.
    if (!cart) {
      return await this.cartRepo.findOrCreateCart(userId);
    }
    return cart;
  }
}