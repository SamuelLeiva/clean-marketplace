import { NextRequest, NextResponse } from 'next/server'
import {
  GetProductById,
  UpdateProduct,
  DeleteProduct,
} from '@/core/use-cases/product'
import { PrismaProductRepository } from '@/infrastructure/database/prisma/repositories'
import { UpdateProductInput } from '@/shared/contracts/product.contract'
import { handleError } from '@/shared/utils/handleError'

const repo = new PrismaProductRepository()

export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return handleError(new Error('Product ID is required'))
    }
    const useCase = new GetProductById(repo)
    const product = await useCase.execute(id)
    return NextResponse.json(product)
  } catch (error) {
    return handleError(error)
  }
}

export async function PUT(req: NextRequest) {
  try {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return handleError(new Error('Product ID is required'))
    }
    const body = await req.json()
    const parsed = UpdateProductInput.parse(body)

    const useCase = new UpdateProduct(repo)
    const updated = await useCase.execute(id, parsed)

    return NextResponse.json(updated)
  } catch (error) {
    return handleError(error)
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.pathname.split('/').pop()
    if (!id) {
      return handleError(new Error('Product ID is required'))
    }
    const useCase = new DeleteProduct(repo)
    await useCase.execute(id)

    return new Response(null, { status: 204 })
  } catch (error) {
    return handleError(error)
  }
}
