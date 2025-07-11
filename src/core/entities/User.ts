import { Cart } from './Cart'

export interface User {
  id: string
  name?: string
  email: string
  createdAt: string
  updatedAt: string

  cart?: Cart
}
