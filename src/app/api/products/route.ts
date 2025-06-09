import { CreateProductInput } from '@/shared/contracts/product.contract'
import { CreateProduct, GetAllProducts } from '@/core/use-cases/product'
import { PrismaProductRepository } from '@/infrastructure/database/prisma'
import { handleError } from '@/shared/utils/handleError'
import { NextRequest, NextResponse } from 'next/server'

const repo = new PrismaProductRepository()

export async function GET() {
  try {
    const useCase = new GetAllProducts(repo)
    const products = await useCase.execute()
    return NextResponse.json(products)
  } catch (error) {
    return handleError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = CreateProductInput.parse(body)

    const useCase = new CreateProduct(repo)
    const newProduct = await useCase.execute(parsed)

    return NextResponse.json(newProduct, { status: 201 })
  } catch (error) {
    return handleError(error)
  }
}
