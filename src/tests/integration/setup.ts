import { PrismaClient } from '@prisma/client'
import { beforeAll, afterAll } from 'vitest'

// Instancia global de Prisma
export const testPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_TEST || process.env.DATABASE_URL,
    },
  },
})

beforeAll(async () => {
  await testPrisma.$connect()

  await cleanDatabase()

  console.log('🔧 Integration test setup completed')
})

// Cleanup global
afterAll(async () => {
  await testPrisma.$disconnect()
  console.log('🧹 Integration test cleanup completed')
})

// Limpiar entre cada test
// beforeEach(async () => {
//   // Opcional: limpiar datos entre tests
//   await cleanDatabase()
// })

// Función helper para limpiar la base de datos
export async function cleanDatabase() {
  // Orden importante: eliminar en orden inverso a las dependencias
  await testPrisma.product.deleteMany()
  await testPrisma.category.deleteMany()
  // Agregar más modelos según sea necesario
}
