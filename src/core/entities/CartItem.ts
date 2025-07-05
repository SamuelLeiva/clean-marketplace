import { Product } from "./Product";

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  product?: Product; 
  quantity: number;
  priceAtTimeOfAddition: number; 
  createdAt: Date;
  updatedAt: Date;
}