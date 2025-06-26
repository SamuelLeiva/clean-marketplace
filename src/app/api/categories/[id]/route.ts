import { NextRequest } from 'next/server'
import {
  GetCategoryById,
  UpdateCategory,
  DeleteCategory,
} from '@/core/use-cases/category' // Adjust path
import { PrismaCategoryRepository } from '@/infrastructure/database/prisma/repositories' // Adjust path
import { UpdateCategoryInput } from '@/shared/contracts/category.contract' // Adjust path

import { handleError } from '@/shared/utils/handleError'
import { successResponse, errorResponse } from '@/shared/utils/apiResponse'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const repo = new PrismaCategoryRepository(prisma)

// GET /api/categories/[id]
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }, // Directly access dynamic route parameter
) {
  try {
    const { id } = await context.params;

    // A check is still good practice, though Next.js routing should ensure `id` exists here
    if (!id) {
      return errorResponse('Category ID is required in the URL path.', 400)
    }

    const useCase = new GetCategoryById(repo)
    const category = await useCase.execute(id) // UseCase will throw CategoryNotFoundError if not found

    return successResponse(category, 'Category fetched successfully.', 200)
  } catch (error) {
    return handleError(error) // Handles CategoryNotFoundError (404) or other errors
  }
}

// PUT /api/categories/[id]
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }, // Directly access dynamic route parameter
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return errorResponse('Category ID is required in the URL path.', 400)
    }

    const body = await req.json()
    const parsed = UpdateCategoryInput.parse(body) // Validate input with Zod

    const useCase = new UpdateCategory(repo)
    const updated = await useCase.execute(id, parsed) // UseCase will throw if category not found

    return successResponse(updated, 'Category updated successfully.', 200)
  } catch (error) {
    return handleError(error) // Handles domain errors (e.g., CategoryNotFoundError, CategoryAlreadyExistsError)
  }
}

// DELETE /api/categories/[id]
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }, // Directly access dynamic route parameter
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return errorResponse('Category ID is required in the URL path.', 400)
    }

    const useCase = new DeleteCategory(repo)
    await useCase.execute(id) // UseCase will throw if category not found or cannot be deleted

    // For successful DELETE with no content, 204 No Content is the standard.
    return successResponse(null, 'Category deleted successfully.', 204)
  } catch (error) {
    return handleError(error) // Handles domain errors (e.g., CategoryNotFoundError, CannotDeleteCategoryError)
  }
}
