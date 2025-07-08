import { User } from '@/core/entities';
import { User as PrismaUser } from '@prisma/client';

export function normalizeUser(user: PrismaUser): User {
  return { // nos aseguramos que no haya password
    id: user.id,
    email: user.email,
    name: user.name ?? undefined, // Convierte null a undefined
    createdAt: user.createdAt.toISOString(), // Asegúrate de convertir Date a string
    updatedAt: user.updatedAt.toISOString(),
  };
}