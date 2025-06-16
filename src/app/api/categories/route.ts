// src/app/api/categories/route.ts

import { NextRequest } from 'next/server';
import { ZodError } from 'zod';

import {
  CreateCategory,
  GetAllCategories,
} from '@/core/use-cases/category'; // Adjust path
import { PrismaCategoryRepository } from '@/infrastructure/database/prisma/repositories'; // Adjust path
import { CreateCategoryInput } from '@/shared/contracts/category.contract'; // Adjust path

import { handleError } from '@/shared/utils/handleError';
import { handleZodError } from '@/shared/utils/handleZodError';
import { successResponse } from '@/shared/utils/apiResponse';

const repo = new PrismaCategoryRepository();

// GET /api/categories
export async function GET() {
  try {
    const useCase = new GetAllCategories(repo);
    const categories = await useCase.execute();

    return successResponse(categories, 'Categories fetched successfully.', 200);
  } catch (error) {
    // handleError will catch any potential database or unexpected errors
    return handleError(error);
  }
}

// POST /api/categories
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CreateCategoryInput.parse(body); // Validate input with Zod

    const useCase = new CreateCategory(repo);
    const newCategory = await useCase.execute(parsed);

    return successResponse(newCategory, 'Category created successfully.', 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return handleZodError(error); // Specific handling for Zod validation errors (400)
    }
    return handleError(error); // Handles domain errors (e.g., CategoryAlreadyExistsError) or unexpected errors
  }
}