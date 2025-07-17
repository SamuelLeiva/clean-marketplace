import { CartRepository } from '@/core/ports/CartRepository';

export class RemoveFromCart {
  constructor(private cartRepo: CartRepository) {}

  async execute(userId: string, cartItemId: string): Promise<void> {
    await this.cartRepo.removeCartItem(userId, cartItemId);
  }
}