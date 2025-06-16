import { CreateProductInput } from '@/shared/contracts/product.contract'
import { CreateProduct, GetAllProducts } from '@/core/use-cases/product'
import { PrismaProductRepository } from '@/infrastructure/database/prisma/repositories'
import { handleError } from '@/shared/utils/handleError'
import { NextRequest } from 'next/server'
import { ZodError } from 'zod'
import { handleZodError } from '@/shared/utils/handleZodError'
import { successResponse } from '@/shared/utils/apiResponse'

const repo = new PrismaProductRepository()

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(req: NextRequest) {
  try {
    const useCase = new GetAllProducts(repo)
    const products = await useCase.execute()
    return successResponse(products, 'Products retrieved successfully', 200)
  } catch (error) {
    if (error instanceof ZodError) {
      return handleZodError(error)
    }
    return handleError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = CreateProductInput.parse(body)

    const useCase = new CreateProduct(repo)
    const newProduct = await useCase.execute(parsed)

    return successResponse(newProduct, 'Product created successfully', 201)
  } catch (error) {
    if (error instanceof ZodError) {
      return handleZodError(error)
    }
    return handleError(error)
  }
}
