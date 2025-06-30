import { NextRequest } from 'next/server'

import { CreateCategory, GetAllCategories } from '@/core/use-cases/category' // Adjust path
import { PrismaCategoryRepository } from '@/infrastructure/database/prisma/repositories' // Adjust path
import { CreateCategoryInput } from '@/shared/contracts/category.contract' // Adjust path

import { handleError } from '@/shared/utils/handleError'
import { errorResponse, successResponse } from '@/shared/utils/apiResponse'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const repo = new PrismaCategoryRepository(prisma)

// GET /api/categories

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

    const useCase = new GetAllCategories(repo);
    // Pass the extracted pagination options to the use case
    const paginatedCategories = await useCase.execute({ page, limit });

    return successResponse(paginatedCategories, 'Categories retrieved successfully', 200);
  } catch (error) {
    return handleError(error);
  }
}

// export async function GET(req: NextRequest) {
//   try {
//     const useCase = new GetAllCategories(repo)
//     const categories = await useCase.execute()

//     return successResponse(categories, 'Categories fetched successfully.', 200)
//   } catch (error) {
//     // handleError will catch any potential database or unexpected errors
//     return handleError(error)
//   }
// }

// POST /api/categories
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = CreateCategoryInput.parse(body) // Validate input with Zod

    const useCase = new CreateCategory(repo)
    const newCategory = await useCase.execute(parsed)

    return successResponse(newCategory, 'Category created successfully.', 201)
  } catch (error) {
    return handleError(error) // Handles domain errors (e.g., CategoryAlreadyExistsError) or unexpected errors
  }
}
