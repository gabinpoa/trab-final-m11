import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      permissions: ['manage_users', 'manage_products', 'manage_orders', 'manage_production', 'manage_inventory'],
    },
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'user' },
    update: {},
    create: {
      name: 'user',
      permissions: ['create_orders', 'view_orders', 'upload_customization'],
    },
  });

  console.log('Roles created');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin User',
      roleId: adminRole.id,
    },
  });

  console.log('Admin user created');

  // Create regular user
  const userPassword = await bcrypt.hash('user123', 10);
  await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password: userPassword,
      name: 'Regular User',
      roleId: userRole.id,
    },
  });

  console.log('Regular user created');

  // Create categories
  const category1 = await prisma.category.upsert({
    where: { name: 'Camisetas' },
    update: {},
    create: {
      name: 'Camisetas',
    },
  });

  const category2 = await prisma.category.upsert({
    where: { name: 'Canecas' },
    update: {},
    create: {
      name: 'Canecas',
    },
  });

  const category3 = await prisma.category.upsert({
    where: { name: 'Chaveiros' },
    update: {},
    create: {
      name: 'Chaveiros',
    },
  });

  console.log('Categories created');

  // Create products
  await prisma.product.upsert({
    where: { id: 'prod-1' },
    update: {},
    create: {
      id: 'prod-1',
      name: 'Camiseta Personalizada Básica',
      description: 'Camiseta de algodão com área para personalização',
      price: 49.90,
      complexity: 1,
      categoryId: category1.id,
      imageUrl: '/uploads/products/prod-1/foto.jpg',
    },
  });

  await prisma.product.upsert({
    where: { id: 'prod-2' },
    update: {},
    create: {
      id: 'prod-2',
      name: 'Camiseta Premium',
      description: 'Camiseta de alta qualidade com múltiplas áreas de personalização',
      price: 79.90,
      complexity: 3,
      categoryId: category1.id,
      imageUrl: '/uploads/products/prod-2/foto.jpg',
    },
  });

  await prisma.product.upsert({
    where: { id: 'prod-3' },
    update: {},
    create: {
      id: 'prod-3',
      name: 'Caneca Cerâmica',
      description: 'Caneca de cerâmica com personalização',
      price: 29.90,
      complexity: 1,
      categoryId: category2.id,
      imageUrl: '/uploads/products/prod-3/foto.jpg',
    },
  });

  await prisma.product.upsert({
    where: { id: 'prod-4' },
    update: {},
    create: {
      id: 'prod-4',
      name: 'Chaveiro Personalizado',
      description: 'Chaveiro de metal com gravação',
      price: 15.90,
      complexity: 1,
      categoryId: category3.id,
      imageUrl: '/uploads/products/prod-4/foto.jpg',
    },
  });

  console.log('Products created');

  // Create materials
  await prisma.material.upsert({
    where: { id: 'mat-1' },
    update: {},
    create: {
      id: 'mat-1',
      name: 'Camiseta Algodão Branca M',
      quantity: 100,
      minLevel: 20,
    },
  });

  await prisma.material.upsert({
    where: { id: 'mat-2' },
    update: {},
    create: {
      id: 'mat-2',
      name: 'Camiseta Algodão Preta M',
      quantity: 80,
      minLevel: 20,
    },
  });

  await prisma.material.upsert({
    where: { id: 'mat-3' },
    update: {},
    create: {
      id: 'mat-3',
      name: 'Tinta para Impressão',
      quantity: 50,
      minLevel: 10,
    },
  });

  await prisma.material.upsert({
    where: { id: 'mat-4' },
    update: {},
    create: {
      id: 'mat-4',
      name: 'Caneca Cerâmica',
      quantity: 60,
      minLevel: 15,
    },
  });

  console.log('Materials created');

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
