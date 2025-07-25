import { NextRequest } from 'next/server'
import {
  GetProductById,
  UpdateProduct,
  DeleteProduct,
} from '@/core/use-cases/product'
import { PrismaProductRepository } from '@/infrastructure/database/prisma/repositories'
import { UpdateProductInput } from '@/shared/contracts/product.contract'
import { handleError } from '@/shared/utils/handleError'
import { errorResponse, successResponse } from '@/shared/utils/apiResponse'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const repo = new PrismaProductRepository(prisma)

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return errorResponse('Product ID is required in the URL path.', 400)
    }

    const useCase = new GetProductById(repo)
    const product = await useCase.execute(id)

    return successResponse(product, 'Product retrieved successfully', 200)
  } catch (error) {
    return handleError(error)
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return errorResponse('Product ID is required in the URL path.', 400)
    }

    const body = await req.json()
    const parsed = UpdateProductInput.parse(body)

    const useCase = new UpdateProduct(repo)
    const updated = await useCase.execute(id, parsed)

    return successResponse(updated, 'Product updated successfully', 200)
  } catch (error) {
    return handleError(error)
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return errorResponse('Product ID is required in the URL path.', 400)
    }

    const useCase = new DeleteProduct(repo)
    await useCase.execute(id)

    return successResponse(null, 'Product deleted successfully', 204)
  } catch (error) {
    return handleError(error)
  }
}
