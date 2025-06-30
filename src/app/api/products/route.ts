import { CreateProductInput } from '@/shared/contracts/product.contract'
import { CreateProduct, GetAllProducts } from '@/core/use-cases/product'
import { PrismaProductRepository } from '@/infrastructure/database/prisma/repositories'
import { handleError } from '@/shared/utils/handleError'
import { NextRequest } from 'next/server'
import { errorResponse, successResponse } from '@/shared/utils/apiResponse'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const repo = new PrismaProductRepository(prisma)

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl; // Get URL search parameters

    // Extract page and limit from query params, parse them as numbers
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10); // Default to 10 items per page

    // Input validation for page and limit (optional but recommended)
    if (isNaN(page) || page < 1) {
      return errorResponse('Invalid page number. Page must be a positive integer.', 400);
    }
    if (isNaN(limit) || limit < 1) {
      return errorResponse('Invalid limit number. Limit must be a positive integer.', 400);
    }

    const useCase = new GetAllProducts(repo);
    // Pass the extracted pagination options to the use case
    const paginatedProducts = await useCase.execute({ page, limit });

    return successResponse(paginatedProducts, 'Products retrieved successfully', 200);
  } catch (error) {
    return handleError(error);
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
