import { ProductRepository } from '@/core/ports'
import {
  GetProductsFilterInput,
  PaginatedProductListResponse,
} from '@/shared/contracts'

// interface GetAllProductsInput {
//   page?: number // Optional page, default to 1
//   limit?: number // Optional limit, default to a sensible number (e.g., 10 or 20)
// }

// The input for the use case is now your filter input
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface GetAllProductsUseCaseInput extends GetProductsFilterInput {} // Re-use the Zod type for input

export class GetAllProducts {
  constructor(private repo: ProductRepository) {}
  async execute(
    input: GetAllProductsUseCaseInput = {
      page: 1,
      limit: 1
    },
  ): Promise<PaginatedProductListResponse> {
    // const page = input.page && input.page > 0 ? input.page : 1
    // const limit = input.limit && input.limit > 0 ? input.limit : 10 // Default limit, adjust as needed

    // const paginationOptions: PaginationOptions = { page, limit }

    // Delegate the actual fetching and pagination logic to the repository
    return await this.repo.findAllPaginated(input)
  }

  // async execute(): Promise<Product[]> {
  //   return await this.repo.findAll()
  // }
}
