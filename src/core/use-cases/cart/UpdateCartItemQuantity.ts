import { CartItem } from '@/core/entities';
import { CartRepository } from '@/core/ports/CartRepository';
import { ProductRepository } from '@/core/ports/ProductRepository'; // Necesario para verificar stock del producto
import { UpdateCartItemInput } from '@/shared/contracts/cart.contract';
import { ProductNotFoundError } from '@/core/errors/product';
import { CartItemNotFoundError, InvalidCartOperationError } from '@/core/errors/cart';

export class UpdateCartItemQuantity {
  constructor(
    private cartRepo: CartRepository,
    private productRepo: ProductRepository, // Inyectar ProductRepository
  ) {}

  async execute(cartItemId: string, input: UpdateCartItemInput): Promise<CartItem> {
    const { quantity } = input;

    // 1. Verificar si el ítem del carrito existe
    const existingItem = await this.cartRepo.getCartItemById(cartItemId);
    if (!existingItem) {
      throw new CartItemNotFoundError(cartItemId);
    }

    // 2. Verificar el stock del producto si la cantidad aumenta
    const product = await this.productRepo.findById(existingItem.productId);
    if (!product) {
      // Esto no debería pasar si el cartItem existe y el productId es válido
      throw new ProductNotFoundError(`Associated product for cart item ${cartItemId} not found.`);
    }

    if (product.stock !== undefined && quantity > product.stock) {
      throw new InvalidCartOperationError(
        `Not enough stock for product "${product.name}". Available: ${product.stock}. Requested: ${quantity}`,
      );
    }

    // 3. Actualizar la cantidad del ítem del carrito
    const updatedItem = await this.cartRepo.updateCartItemQuantity(cartItemId, quantity);

    return updatedItem;
  }
}