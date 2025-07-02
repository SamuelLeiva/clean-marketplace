import { CreateProductInput, GetProductsFilterInput } from '@/shared/contracts/product.contract'
import { CreateProduct, GetAllProducts } from '@/core/use-cases/product'
import { PrismaProductRepository } from '@/infrastructure/database/prisma/repositories'
import { handleError } from '@/shared/utils/handleError'
import { NextRequest } from 'next/server'
import { successResponse } from '@/shared/utils/apiResponse'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const repo = new PrismaProductRepository(prisma)

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl // Get URL search parameters

    // Convert URLSearchParams to a plain object for Zod validation
    const queryParams: Record<string, unknown> = {}
    for (const [key, value] of searchParams.entries()) {
      // Zod will handle type coercion for numbers/booleans if you use .transform() or .pipe()
      // For simplicity, we'll parse basic types here or let Zod's .pipe(z.coerce.number()) handle it.
      if (
        [
          'page',
          'limit',
          'minStock',
          'maxStock',
          'minPrice',
          'maxPrice',
        ].includes(key)
      ) {
        queryParams[key] = parseFloat(value) // Use parseFloat for price, parseInt for stock/page/limit
      } else {
        queryParams[key] = value
      }
    }

    // --- Validate query parameters using Zod ---
    // Make sure to parse numbers correctly as Zod's parse will treat query strings as strings initially.
    // Use z.coerce.number() for robust conversion from string to number.
    const filters = GetProductsFilterInput.parse({
      name: queryParams.name,
      minStock: queryParams.minStock,
      maxStock: queryParams.maxStock,
      minPrice: queryParams.minPrice,
      maxPrice: queryParams.maxPrice,
      categoryId: queryParams.categoryId,
      page: queryParams.page, // Zod's default will apply if not present
      limit: queryParams.limit, // Zod's default will apply if not present
    })

    const useCase = new GetAllProducts(repo)
    const paginatedProducts = await useCase.execute(filters)

    return successResponse(
      paginatedProducts,
      'Products retrieved successfully',
      200,
    )
  } catch (error) {
    return handleError(error)
  }
}

// export async function GET(req: NextRequest) {
//   try {
//     const useCase = new GetAllProducts(repo)
//     const products = await useCase.execute()
//     return successResponse(products, 'Products retrieved successfully', 200)
//   } catch (error) {
//     return handleError(error)
//   }
// }

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = CreateProductInput.parse(body)

    const useCase = new CreateProduct(repo)
    const newProduct = await useCase.execute(parsed)

    return successResponse(newProduct, 'Product created successfully', 201)
  } catch (error) {
    return handleError(error)
  }
}
