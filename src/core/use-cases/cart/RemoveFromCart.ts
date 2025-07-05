import { CartItemNotFoundError } from '@/core/errors/cart';
import { CartRepository } from '@/core/ports/CartRepository';

export class RemoveFromCart {
  constructor(private cartRepo: CartRepository) {}

  async execute(cartItemId: string): Promise<void> {
    // 1. Opcional: Verificar si el ítem del carrito existe antes de intentar eliminar
    // Esto asegura que lanzamos un error claro si el ID no es válido.
    const existingItem = await this.cartRepo.getCartItemById(cartItemId);
    if (!existingItem) {
      throw new CartItemNotFoundError(cartItemId);
    }

    // 2. Eliminar el ítem del carrito
    await this.cartRepo.removeCartItem(cartItemId);
  }
}