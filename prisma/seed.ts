import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log('Limpiando la base de datos...');
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  console.log('Base de datos limpiada.');

  console.log('Iniciando la inserción de datos...');

  // --- 1. Insertar Categorías ---
  const category1 = await prisma.category.upsert({
    where: { name: 'Electrónica' },
    update: {}, 
    create: {
      name: 'Electrónica',
      description: 'Productos electrónicos como teléfonos, computadoras y accesorios.',
    },
  });

  const category2 = await prisma.category.upsert({
    where: { name: 'Ropa' },
    update: {},
    create: {
      name: 'Ropa',
      description: 'Ropa y accesorios de moda.',
    },
  });

  const category3 = await prisma.category.upsert({
    where: { name: 'Hogar y Jardín' },
    update: {},
    create: {
      name: 'Hogar y Jardín',
      description: 'Todo lo relacionado con el hogar y el jardín.',
    },
  });

  const category4 = await prisma.category.upsert({
    where: { name: 'Libros' },
    update: {},
    create: {
      name: 'Libros',
      description: 'Una colección de libros de diversos géneros.',
    },
  });

  const category5 = await prisma.category.upsert({
    where: { name: 'Videojuegos' },
    update: {},
    create: {
      name: 'Videojuegos',
      description: 'Una colección de videojuegos de diversos géneros.',
    },
  });

  const category6 = await prisma.category.upsert({
    where: { name: 'Calzado' },
    update: {},
    create: {
      name: 'Calzado',
      description: 'Una colección de calzado de diversos estilos.',
    },
  });

  console.log('Categorías insertadas/actualizadas:', {
    category1,
    category2,
    category3,
    category4,
    category5,
    category6,
  });

  // --- 2. Insertar Productos ---
  const product1 = await prisma.product.upsert({
    where: { id: 'prod_001' }, // Un ID fijo para upsert, puedes usar un UUID aleatorio si no quieres un ID fijo
    update: {
      name: 'Smartphone X',
      description: 'El último modelo de smartphone con cámara de alta resolución.',
      price: 799.99,
      stock: 50,
      imageUrl: 'https://example.com/smartphone-x.jpg',
      categoryId: category1.id, // Enlaza al ID de la categoría "Electrónica"
    },
    create: {
      id: 'prod_001', // Solo si quieres un ID fijo para el upsert, de lo contrario, déjalo que Prisma lo genere
      name: 'Smartphone X',
      description: 'El último modelo de smartphone con cámara de alta resolución.',
      price: 799.99,
      stock: 50,
      imageUrl: 'https://example.com/smartphone-x.jpg',
      categoryId: category1.id, // Enlaza al ID de la categoría "Electrónica"
    },
  });

  const product2 = await prisma.product.upsert({
    where: { id: 'prod_002' },
    update: {
      name: 'Camiseta Algodón Orgánico',
      description: 'Camiseta suave y cómoda hecha de algodón 100% orgánico.',
      price: 25.00,
      stock: 200,
      imageUrl: 'https://example.com/camiseta-organica.jpg',
      categoryId: category2.id, // Enlaza al ID de la categoría "Ropa"
    },
    create: {
      id: 'prod_002',
      name: 'Camiseta Algodón Orgánico',
      description: 'Camiseta suave y cómoda hecha de algodón 100% orgánico.',
      price: 25.00,
      stock: 200,
      imageUrl: 'https://example.com/camiseta-organica.jpg',
      categoryId: category2.id, // Enlaza al ID de la categoría "Ropa"
    },
  });

  const product3 = await prisma.product.upsert({
    where: { id: 'prod_003' },
    update: {
      name: 'Set de Sartenes Antiadherentes',
      description: 'Set de 3 sartenes de alta calidad para tu cocina.',
      price: 89.99,
      stock: 30,
      imageUrl: 'https://example.com/sartenes.jpg',
      categoryId: category3.id, // Enlaza al ID de la categoría "Hogar y Jardín"
    },
    create: {
      id: 'prod_003',
      name: 'Set de Sartenes Antiadherentes',
      description: 'Set de 3 sartenes de alta calidad para tu cocina.',
      price: 89.99,
      stock: 30,
      imageUrl: 'https://example.com/sartenes.jpg',
      categoryId: category3.id, // Enlaza al ID de la categoría "Hogar y Jardín"
    },
  });

  console.log('Productos insertados/actualizados:', {
    product1,
    product2,
    product3,
  });
}

main()
  .catch((e) => {
    console.error('Error durante la inserción de datos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('Conexión a la base de datos cerrada.');
  });