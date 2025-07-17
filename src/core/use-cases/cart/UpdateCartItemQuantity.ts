import { CartItem } from '@/core/entities'
import { CartRepository } from '@/core/ports/CartRepository'
import { ProductRepository } from '@/core/ports/ProductRepository' // Necesario para verificar stock del producto
import { UpdateCartItemInput } from '@/shared/contracts/cart.contract'
import { ProductNotFoundError } from '@/core/errors/product'
import {
  CartItemNotFoundError,
  InvalidCartOperationError,
} from '@/core/errors/cart'

export class UpdateCartItemQuantity {
  constructor(
    private cartRepo: CartRepository,
    private productRepo: ProductRepository, // Inyectar ProductRepository
  ) {}

  async execute(
    userId: string,
    cartItemId: string,
    input: UpdateCartItemInput,
  ): Promise<CartItem> {
    const { quantity } = input

    // 1. Obtener el ítem del carrito para sus datos actuales y el ID del producto
    // El repositorio NO hará la validación de propiedad en este `getCartItemById`,
    // pero nos da el existingItem para que el Use Case pueda verificar el stock.
    const existingItem = await this.cartRepo.getCartItemById(cartItemId)
    if (!existingItem) {
      // Si el item no existe, lanzar este error antes de ir al repositorio para update.
      throw new CartItemNotFoundError(cartItemId)
    }

    // 2. Verificar el stock del producto con la NUEVA cantidad
    // Esta es una regla de negocio del dominio que el Use Case debe coordinar.
    // El repositorio, al recibir 'quantity', no sabe si es un incremento o decremento,
    // solo que es la nueva cantidad final.
    const product = await this.productRepo.findById(existingItem.productId)
    if (!product) {
      // Esto indica una inconsistencia de datos si un CartItem apunta a un Product que no existe.
      throw new ProductNotFoundError(
        `Associated product for cart item ${cartItemId} not found.`,
      )
    }

    // ✅ La validación de stock se mantiene aquí en el Use Case, ya que es una regla de negocio
    if (product.stock < quantity) {
      throw new InvalidCartOperationError(
        `Not enough stock for product "${product.name}". Available: ${product.stock}. Requested: ${quantity}`,
      )
    }

    // ✅ La lógica de cantidad <= 0 se traslada al repositorio, o puedes dejarla aquí si prefieres.
    // Si la dejamos en el repositorio, el repositorio lanzará InvalidCartOperationError o lo manejará.
    // Si el Use Case debe tener control explícito sobre la eliminación, lo haríamos así:
    if (quantity <= 0) {
      // Delegar la eliminación a otro Use Case o a un método específico del repositorio
      await this.cartRepo.removeCartItem(userId, cartItemId) // Reutilizar el método de eliminación del repositorio
      // Podrías devolver null, o un objeto que indique eliminación.
      // O si quieres que siempre devuelva CartItem, necesitarías un flujo distinto.
      // Para simplificar, y dado que el contrato es Promise<CartItem>,
      // dejaremos que el repositorio maneje el error si quantity <= 0
      // o asumiremos que el Use Case de eliminación se llama por separado.
      // Por ahora, el repositorio lanzará el error como lo tienes.
      // Considera si tu API/frontend necesita manejar la eliminación como un "update to 0" vs. una "delete" separada.
    }

    // 3. Delegar la actualización al repositorio.
    // El repositorio ahora manejará la verificación de propiedad y la lógica de cantidad <= 0.
    const updatedItem = await this.cartRepo.updateCartItemQuantity(
      userId, // Repositorio verifica propiedad
      cartItemId,
      quantity, // Repositorio maneja la cantidad 0/negativa
    )

    return updatedItem
  }
}
