import { Product } from "../entities/Product"

export interface ProductRepository {
    create(product: Product): Promise<Product>
    findById(id: string): Promise<Product | null>
    findAll(): Promise<Product[]>
    update(id: string, product: Partial<Product>): Promise<Product>
    delete(id: string): Promise<void>
}