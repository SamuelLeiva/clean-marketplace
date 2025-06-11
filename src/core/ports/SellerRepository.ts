import { Seller } from '../entities'

export interface SellerRepository {
  create(seller: Seller): Promise<Seller>
  findById(id: string): Promise<Seller | null>
  findAll(): Promise<Seller[]>
  update(id: string, Seller: Partial<Seller>): Promise<Seller>
  delete(id: string): Promise<void>
}
