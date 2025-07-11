import { CreateProductInput, GetProductsFilterInput, PaginatedProductListResponse, UpdateProductInput } from '@/shared/contracts'
import { Product } from '../entities'

export interface ProductRepository {
  create(product: CreateProductInput): Promise<Product>
  findById(id: string): Promise<Product | null>
  findAllPaginated(filters: GetProductsFilterInput): Promise<PaginatedProductListResponse>
  update(id: string, product: UpdateProductInput): Promise<Product>
  delete(id: string): Promise<void>
  findByName(name: string): Promise<Product | null>
  isInUse(id: string): Promise<boolean>
}
