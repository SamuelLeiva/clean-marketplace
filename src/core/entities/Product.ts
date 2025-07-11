import { CartItem } from './CartItem'
import { Category } from './Category'

export interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  imageUrl?: string
  categoryId: string
  createdAt: string
  updatedAt: string

  category?: Category
  cartItems?: CartItem[]
}
