import { CartItem } from '@/core/entities';
import { InvalidCartOperationError } from '@/core/errors/cart';
import { ProductNotFoundError } from '@/core/errors/product';
import { CartRepository } from '@/core/ports/CartRepository';
import { ProductRepository } from '@/core/ports/ProductRepository';
import { AddToCartInput } from '@/shared/contracts/cart.contract';

export class AddToCart {
  constructor(
    private cartRepo: CartRepository,
    private productRepo: ProductRepository,
  ) {}

  async execute(userId: string, input: AddToCartInput): Promise<CartItem> {
    const { productId, quantity } = input;

    // 1. Obtener el producto para confirmar su existencia y obtener su precio actual
    const product = await this.productRepo.findById(productId);
    if (!product) {
      throw new ProductNotFoundError(`Product with ID ${productId} not found.`);
    }

    // 2. Verificar stock (importante para evitar añadir más de lo disponible)
    if (product.stock !== undefined && product.stock < quantity) {
      throw new InvalidCartOperationError(
        `Not enough stock for product "${product.name}". Available: ${product.stock}`,
      );
    }

    // 3. Encontrar o crear el carrito activo del usuario
    const cart = await this.cartRepo.findOrCreateCart(userId);

    // 4. Añadir o actualizar el producto en el carrito
    const cartItem = await this.cartRepo.addProductToCart(
      cart.id,
      productId,
      quantity,
      product.price, // Usar el precio actual del producto
    );

    return cartItem;
  }
}