import { NextRequest } from 'next/server'

import { CreateCategory, GetAllCategories } from '@/core/use-cases/category' // Adjust path
import { PrismaCategoryRepository } from '@/infrastructure/database/prisma/repositories' // Adjust path
import { CreateCategoryInput } from '@/shared/contracts/category.contract' // Adjust path

import { handleError } from '@/shared/utils/handleError'
import { successResponse } from '@/shared/utils/apiResponse'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const repo = new PrismaCategoryRepository(prisma)

// GET /api/categories

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(req: NextRequest) {
  try {
    const useCase = new GetAllCategories(repo)
    const categories = await useCase.execute()

    return successResponse(categories, 'Categories fetched successfully.', 200)
  } catch (error) {
    // handleError will catch any potential database or unexpected errors
    return handleError(error)
  }
}

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
