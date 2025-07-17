
import { Cart, CartItem } from '@/core/entities';

export interface CartRepository {
  // Find or create an active cart for a user
  findOrCreateCart(userId: string): Promise<Cart>;

  // Get a cart by its ID (for direct manipulation)
  getCartById(cartId: string): Promise<Cart | null>;

  // Get a user's active cart with its items
  getCartByUserId(userId: string): Promise<Cart | null>;

  // Add a product to the cart or update its quantity
  addProductToCart(cartId: string, productId: string, quantity: number, price: number): Promise<CartItem>;

  // Update quantity of an existing cart item
  updateCartItemQuantity(userId: string, cartItemId: string, quantity: number): Promise<CartItem>;

  // Remove a product from the cart
  removeCartItem(userId: string, cartItemId: string): Promise<void>;

  // Clear all items from a cart
  clearCart(cartId: string): Promise<void>;

  // Check if a cart item exists (useful before updating/deleting)
  getCartItemById(cartItemId: string): Promise<CartItem | null>;
}