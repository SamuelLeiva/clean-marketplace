import { CreateProductInput, UpdateProductInput } from '@/shared/contracts'
import { Product } from '../entities'

export interface ProductRepository {
  create(product: CreateProductInput): Promise<Product>
  findById(id: string): Promise<Product | null>
  findAll(): Promise<Product[]>
  update(id: string, product: UpdateProductInput): Promise<Product>
  delete(id: string): Promise<void>

  // Métodos adicionales al CRUD clásico
  findByName(name: string): Promise<Product | null>
  isInUse(id: string): Promise<boolean>
}
