import { NextResponse } from 'next/server'
import {
  GetProductById,
  UpdateProduct,
  DeleteProduct,
} from '@/core/use-cases/product'
import { PrismaProductRepository } from '@/infrastructure/database/prisma'
import { UpdateProductInput } from '@/shared/contracts/product.contract'
import { handleError } from '@/shared/utils/handleError'

const repo = new PrismaProductRepository()

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const useCase = new GetProductById(repo)
    const product = await useCase.execute(params.id)
    return NextResponse.json(product)
  } catch (error) {
    return handleError(error)
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const body = await req.json()
    const parsed = UpdateProductInput.parse(body)

    const useCase = new UpdateProduct(repo)
    const updated = await useCase.execute(params.id, parsed)

    return NextResponse.json(updated)
  } catch (error) {
    return handleError(error)
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } },
) {
  try {
    const useCase = new DeleteProduct(repo)
    await useCase.execute(params.id)

    return new Response(null, { status: 204 })
  } catch (error) {
    return handleError(error)
  }
}
