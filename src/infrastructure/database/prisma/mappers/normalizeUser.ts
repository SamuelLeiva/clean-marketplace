import { User } from '@/core/entities';
import { User as PrismaUser } from '@prisma/client';

export function normalizeUser(user: PrismaUser): User {
  return {
    ...user,
    name: user.name ?? undefined,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}