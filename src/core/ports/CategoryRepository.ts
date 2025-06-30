import { CreateCategoryInput, PaginatedCategoryListResponse, UpdateCategoryInput } from '@/shared/contracts'
import { Category } from '../entities'

export interface PaginationOptions {
  page: number;
  limit: number;
  // You might add orderBy, filters, etc. later
}

export interface CategoryRepository {
  create(input: CreateCategoryInput): Promise<Category>
  findById(id: string): Promise<Category | null>
  //findAll(): Promise<Category[]>
  findAllPaginated(options: PaginationOptions): Promise<PaginatedCategoryListResponse>
  update(id: string, category: UpdateCategoryInput): Promise<Category>
  delete(id: string): Promise<void>

  // Métodos adicionales al CRUD clásico
  findByName(name: string): Promise<Category | null>
  isInUse(id: string): Promise<boolean>
}
