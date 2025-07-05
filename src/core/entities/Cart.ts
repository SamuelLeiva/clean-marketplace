import { CartItem } from './CartItem';

export interface Cart {
  id: string;
  userId: string;
  status: 'active' | 'abandoned' | 'converted';
  createdAt: Date;
  updatedAt: Date;
  cartItems: CartItem[]; // Relación con los ítems individuales del carrito
}