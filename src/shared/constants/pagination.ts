import { z } from "zod";

export const PaginationMetaSchema = z.object({
  totalItems: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
  currentPage: z.number().int().positive(),
  itemsPerPage: z.number().int().positive(),
})

export interface PaginationOptions {
  page: number;
  limit: number;
  // You might add orderBy, filters, etc. later
}