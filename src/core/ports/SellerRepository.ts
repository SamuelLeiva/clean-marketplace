import { CreateSellerInput, UpdateSellerInput } from '@/shared/contracts'
import { Seller } from '../entities'

export interface SellerRepository {
  create(seller: CreateSellerInput): Promise<Seller>
  findById(id: string): Promise<Seller | null>
  findAll(): Promise<Seller[]>
  update(id: string, seller: UpdateSellerInput): Promise<Seller>
  delete(id: string): Promise<void>

  // Métodos adicionales al CRUD clásico
  findByName(name: string): Promise<Seller | null>
  isInUse(id: string): Promise<boolean>
}
