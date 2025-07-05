import { CartItem } from './CartItem';

export interface Cart {
  id: string;
  userId: string;
  status: 'active' | 'abandoned' | 'converted';
  createdAt: string;
  updatedAt: string;
  cartItems: CartItem[]; // Relación con los ítems individuales del carrito
}