//import { Category } from '@/core/entities'
import { CategoryRepository, PaginationOptions } from '@/core/ports'
import { PaginatedCategoryListResponse } from '@/shared/contracts'

interface GetAllCategoriesInput {
  page?: number // Optional page, default to 1
  limit?: number // Optional limit, default to a sensible number (e.g., 10 or 20)
}

export class GetAllCategories {
  constructor(private repo: CategoryRepository) {}

  async execute(
    input: GetAllCategoriesInput = {},
  ): Promise<PaginatedCategoryListResponse> {
    const page = input.page && input.page > 0 ? input.page : 1;
    const limit = input.limit && input.limit > 0 ? input.limit : 10; // Default limit, adjust as needed

    const paginationOptions: PaginationOptions = { page, limit };

    // Delegate the actual fetching and pagination logic to the repository
    return await this.repo.findAllPaginated(paginationOptions);
  }
  // async execute(): Promise<Category[]> {
  //   return await this.repo.findAll()
  // }
}
