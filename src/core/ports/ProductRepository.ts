import { CreateProductInput, PaginatedProductListResponse, UpdateProductInput } from '@/shared/contracts'
import { Product } from '../entities'
import { PaginationOptions } from '@/shared/constants/pagination'

export interface ProductRepository {
  create(product: CreateProductInput): Promise<Product>
  findById(id: string): Promise<Product | null>
  //findAll(): Promise<Product[]>
  findAllPaginated(options: PaginationOptions): Promise<PaginatedProductListResponse>
  update(id: string, product: UpdateProductInput): Promise<Product>
  delete(id: string): Promise<void>

  // Métodos adicionales al CRUD clásico
  findByName(name: string): Promise<Product | null>
  isInUse(id: string): Promise<boolean>
}
