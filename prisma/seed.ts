// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Elimina datos anteriores (opcional en desarrollo)
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()

  // Crear categorías
  const books = await prisma.category.create({
    data: { name: 'Books' },
  })

  const electronics = await prisma.category.create({
    data: { name: 'Electronics' },
  })

  // Crear productos
  await prisma.product.createMany({
    data: [
      {
        name: 'Clean Code',
        price: 39.99,
        categoryId: books.id,
        description: "Awesome book"
      },
      {
        name: 'The Pragmatic Programmer',
        price: 42.5,
        categoryId: books.id,
        description: "Awesome book 2"
      },
      {
        name: 'Smartphone XYZ',
        price: 599.99,
        categoryId: electronics.id,
        description: "Awesome smartphone"
      },
    ],
  })

  console.log('✅ Seed completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => {
    prisma.$disconnect()
  })
