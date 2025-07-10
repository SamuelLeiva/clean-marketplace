import { PrismaClient } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid' // Importa la función para generar UUIDs
import bcrypt from 'bcryptjs' // Importa bcryptjs para hashear contraseñas

const prisma = new PrismaClient()

async function main() {
  console.log('--- Iniciando el proceso de Seed ---')

  console.log('Limpiando la base de datos...')
  await prisma.cartItem.deleteMany({}) // Eliminar ítems de carrito primero
  await prisma.cart.deleteMany({}) // Luego carritos
  await prisma.product.deleteMany({}) // Luego productos
  await prisma.category.deleteMany({}) // Luego categorías
  await prisma.user.deleteMany({}) // Finalmente usuarios
  console.log('Base de datos limpia.')

  console.log('Iniciando la inserción de datos...')

  // --- 1. Insertar Usuarios de Prueba ---
  const usersToCreate = [
    {
      email: 'test@example.com',
      name: 'Test User',
      rawPassword: 'Password123!', // Contraseña en texto plano para hashear
    },
    {
      email: 'admin@example.com',
      name: 'Admin User',
      rawPassword: 'AdminPassword123!', // Contraseña en texto plano para hashear
    },
    {
      email: 'cartuser@example.com',
      name: 'Cart User',
      rawPassword: 'CartPassword123!',
    },
  ]

  const createdUsers = []
  for (const userData of usersToCreate) {
    const hashedPassword = await bcrypt.hash(userData.rawPassword, 10) // Hashear la contraseña
    const user = await prisma.user.create({
      data: {
        id: uuidv4(), // Generar UUID para el usuario
        email: userData.email,
        name: userData.name,
        password: hashedPassword, // Guardar la contraseña hasheada
      },
    })
    createdUsers.push(user)
    console.log(`- Creado usuario: ${user.email} con ID: ${user.id}`)
  }

  // Obtener usuarios específicos por conveniencia
  const cartUser = createdUsers.find((u) => u.email === 'cartuser@example.com')

  // --- 2. Insertar Categorías ---
  // Usaremos `create` en lugar de `upsert` después de limpiar la DB,
  // y generaremos IDs con UUID si tu modelo de Category tiene `@id @default(uuid())` o similar.
  // Si tu modelo Category usa auto-increment ID o no tiene @id explícito en el schema.prisma
  // para 'id', simplemente omite 'id: uuidv4()' para las categorías y Prisma lo gestionará.
  // Asumo que Category también tiene un campo `id` de tipo `String` con `@default(uuid())`.

  const category1 = await prisma.category.create({
    data: {
      id: uuidv4(), // Generar UUID para la categoría
      name: 'Electrónica',
      description:
        'Productos electrónicos como teléfonos, computadoras y accesorios.',
    },
  })

  const category2 = await prisma.category.create({
    data: {
      id: uuidv4(), // Generar UUID para la categoría
      name: 'Ropa',
      description: 'Ropa y accesorios de moda.',
    },
  })

  const category3 = await prisma.category.create({
    data: {
      id: uuidv4(), // Generar UUID para la categoría
      name: 'Hogar y Jardín',
      description: 'Todo lo relacionado con el hogar y el jardín.',
    },
  })

  const category4 = await prisma.category.create({
    data: {
      id: uuidv4(), // Generar UUID para la categoría
      name: 'Libros',
      description: 'Una colección de libros de diversos géneros.',
    },
  })

  const category5 = await prisma.category.create({
    data: {
      id: uuidv4(), // Generar UUID para la categoría
      name: 'Videojuegos',
      description: 'Una colección de videojuegos de diversos géneros.',
    },
  })

  const category6 = await prisma.category.create({
    data: {
      id: uuidv4(), // Generar UUID para la categoría
      name: 'Calzado',
      description: 'Una colección de calzado de diversos estilos.',
    },
  })

  console.log('Categorías insertadas.')

  // --- 3. Insertar Productos ---
  // Usar IDs generados con uuidv4() para los productos
  const product1 = await prisma.product.create({
    data: {
      id: uuidv4(), // Generar UUID para el producto
      name: 'Smartphone X',
      description:
        'El último modelo de smartphone con cámara de alta resolución.',
      price: 799.99,
      stock: 50,
      imageUrl: 'https://example.com/smartphone-x.jpg',
      categoryId: category1.id, // Enlaza al ID de la categoría "Electrónica"
    },
  })

  // product 2
  await prisma.product.create({
    data: {
      id: uuidv4(), // Generar UUID para el producto
      name: 'Camiseta Algodón Orgánico',
      description: 'Camiseta suave y cómoda hecha de algodón 100% orgánico.',
      price: 25.0,
      stock: 200,
      imageUrl: 'https://example.com/camiseta-organica.jpg',
      categoryId: category2.id, // Enlaza al ID de la categoría "Ropa"
    },
  })

  const product3 = await prisma.product.create({
    data: {
      id: uuidv4(), // Generar UUID para el producto
      name: 'Set de Sartenes Antiadherentes',
      description: 'Set de 3 sartenes de alta calidad para tu cocina.',
      price: 89.99,
      stock: 30,
      imageUrl: 'https://example.com/sartenes.jpg',
      categoryId: category3.id, // Enlaza al ID de la categoría "Hogar y Jardín"
    },
  })

  //product 4
  await prisma.product.create({
    data: {
      id: uuidv4(),
      name: 'El Gran Gatsby',
      description: 'Un clásico de la literatura americana.',
      price: 15.0,
      stock: 100,
      imageUrl: 'https://example.com/gatsby.jpg',
      categoryId: category4.id,
    },
  })

  //product 5
  await prisma.product.create({
    data: {
      id: uuidv4(),
      name: 'Cyberpunk 2077',
      description: 'Juego de rol de acción y ciencia ficción.',
      price: 59.99,
      stock: 75,
      imageUrl: 'https://example.com/cyberpunk.jpg',
      categoryId: category5.id,
    },
  })
  //product 6
  await prisma.product.create({
    data: {
      id: uuidv4(),
      name: 'Zapatillas Deportivas',
      description:
        'Zapatillas cómodas y con estilo para tus actividades diarias.',
      price: 75.0,
      stock: 120,
      imageUrl: 'https://example.com/zapatillas.jpg',
      categoryId: category6.id,
    },
  })

  console.log('Productos insertados.')

  // --- 4. Añadir un carrito y algunos ítems para el "cartuser" ---
  if (cartUser) {
    const cartId = uuidv4()
    const cart = await prisma.cart.create({
      data: {
        id: cartId,
        userId: cartUser.id,
        status: 'ACTIVE',
      },
    })
    console.log(`- Creado carrito para ${cartUser.email} con ID: ${cart.id}`)

    // Añadir ítems al carrito
    await prisma.cartItem.create({
      data: {
        id: uuidv4(),
        cartId: cart.id,
        productId: product1.id, // Smartphone X
        quantity: 1,
        priceAtTimeOfAddition: product1.price,
      },
    })
    console.log(`- Añadido '${product1.name}' al carrito de ${cartUser.email}.`)

    await prisma.cartItem.create({
      data: {
        id: uuidv4(),
        cartId: cart.id,
        productId: product3.id, // Set de Sartenes
        quantity: 2,
        priceAtTimeOfAddition: product3.price,
      },
    })
    console.log(`- Añadido '${product3.name}' al carrito de ${cartUser.email}.`)
  } else {
    console.warn(
      'Usuario "cartuser@example.com" no encontrado para crear el carrito de prueba.',
    )
  }

  console.log('--- Proceso de Seed Finalizado ---')
}

main()
  .catch((e) => {
    console.error('Error durante la inserción de datos:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    console.log('Conexión a la base de datos cerrada.')
  })
