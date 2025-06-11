import { Category } from '../entities'

export interface CategoryRepository {
  create(category: Category): Promise<Category>
  findById(id: string): Promise<Category | null>
  findAll(): Promise<Category[]>
  update(id: string, category: Partial<Category>): Promise<Category>
  delete(id: string): Promise<void>

  // Métodos adicionales al CRUD clásico
  findByName(name: string): Promise<Category | null>
  isInUse(id: string): Promise<boolean>
}
