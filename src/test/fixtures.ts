// Test fixtures - mock data for tests

export const userFixtures = {
  admin: {
    id: '1',
    email: 'admin@example.com',
    name: 'Admin User',
    password: 'hashedPassword',
    role: { name: 'admin' },
  },
  user: {
    id: '2',
    email: 'user@example.com',
    name: 'Regular User',
    password: 'hashedPassword',
    role: { name: 'user' },
  },
  newUser: {
    email: 'newuser@example.com',
    password: 'password123',
    name: 'New User',
  },
};

export const materialFixtures = {
  material1: {
    id: '1',
    name: 'Camiseta Algodão Branca M',
    quantity: 100,
    minLevel: 20,
    version: 0,
  },
  material2: {
    id: '2',
    name: 'Camiseta Algodão Preta M',
    quantity: 80,
    minLevel: 20,
    version: 0,
  },
  material3: {
    id: '3',
    name: 'Tinta para Impressão',
    quantity: 50,
    minLevel: 10,
    version: 0,
  },
  lowStockMaterial: {
    id: '4',
    name: 'Caneca Cerâmica',
    quantity: 15,
    minLevel: 20,
    version: 0,
  },
  newMaterial: {
    name: 'Novo Material',
    quantity: 50,
    minLevel: 20,
  },
};

export const categoryFixtures = {
  category1: {
    id: '1',
    name: 'Camisetas',
  },
  category2: {
    id: '2',
    name: 'Canecas',
  },
  category3: {
    id: '3',
    name: 'Chaveiros',
  },
};

export const productFixtures = {
  product1: {
    id: '1',
    name: 'Camiseta Personalizada Básica',
    description: 'Camiseta de algodão com personalização básica',
    price: 49.99,
    complexity: 1,
    categoryId: '1',
    imageUrl: '/uploads/products/prod-1/foto.jpg',
  },
  product2: {
    id: '2',
    name: 'Camiseta Premium',
    description: 'Camiseta premium com personalização avançada',
    price: 79.99,
    complexity: 3,
    categoryId: '1',
    imageUrl: '/uploads/products/prod-2/foto.jpg',
  },
  product3: {
    id: '3',
    name: 'Caneca Cerâmica',
    description: 'Caneca de cerâmica personalizada',
    price: 29.99,
    complexity: 1,
    categoryId: '2',
    imageUrl: '/uploads/products/prod-3/foto.jpg',
  },
  newProduct: {
    name: 'Novo Produto',
    description: 'Descrição do novo produto',
    price: 99.99,
    complexity: 2,
    categoryId: '1',
  },
};

export const orderFixtures = {
  order1: {
    id: '1',
    userId: '2',
    status: 'pending',
    total: 99.98,
    freight: 15.00,
    deliveryDate: null,
    items: [
      {
        id: '1',
        productId: '1',
        quantity: 2,
        price: 49.99,
        product: {
          id: '1',
          name: 'Camiseta Personalizada Básica',
          price: 49.99,
        },
      },
    ],
  },
  order2: {
    id: '2',
    userId: '2',
    status: 'approved',
    total: 79.99,
    freight: 12.00,
    deliveryDate: new Date('2024-02-01'),
    items: [
      {
        id: '2',
        productId: '2',
        quantity: 1,
        price: 79.99,
        product: {
          id: '2',
          name: 'Camiseta Premium',
          price: 79.99,
        },
      },
    ],
  },
  newOrder: {
    userId: '2',
    items: [
      {
        productId: '1',
        quantity: 2,
        price: 49.99,
      },
    ],
    total: 99.98,
    freight: 15.00,
  },
};

export const viaCepFixtures = {
  validAddress: {
    cep: '01310-100',
    logradouro: 'Avenida Paulista',
    complemento: '',
    bairro: 'Bela Vista',
    localidade: 'São Paulo',
    uf: 'SP',
    ibge: '3550308',
    gia: '1004',
    ddd: '11',
    siafi: '7107',
  },
  invalidCep: {
    erro: true,
  },
};

export const holidayFixtures = {
  holidays2024: [
    { date: '2024-01-01', name: 'Confraternização Mundial', type: 'national' },
    { date: '2024-02-12', name: 'Carnaval', type: 'national' },
    { date: '2024-03-29', name: 'Sexta-feira Santa', type: 'national' },
    { date: '2024-04-21', name: 'Tiradentes', type: 'national' },
    { date: '2024-05-01', name: 'Dia do Trabalho', type: 'national' },
  ],
};

export const authFixtures = {
  validToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test',
  invalidToken: 'invalid.token.here',
  expiredToken: 'expired.token.here',
};

export const imageFixtures = {
  validImage: {
    path: '/tmp/test-image.jpg',
    originalname: 'test-image.jpg',
    mimetype: 'image/jpeg',
    size: 1024 * 1024, // 1MB
  },
  invalidFormat: {
    path: '/tmp/test-file.pdf',
    originalname: 'test-file.pdf',
    mimetype: 'application/pdf',
    size: 1024 * 1024,
  },
  largeImage: {
    path: '/tmp/large-image.jpg',
    originalname: 'large-image.jpg',
    mimetype: 'image/jpeg',
    size: 10 * 1024 * 1024, // 10MB
  },
  smallImage: {
    path: '/tmp/small-image.jpg',
    originalname: 'small-image.jpg',
    mimetype: 'image/jpeg',
    size: 50 * 1024, // 50KB
  },
};

// Helper function to create mock request object
export const createMockRequest = (overrides: any = {}) => ({
  headers: {},
  body: {},
  params: {},
  query: {},
  file: null,
  user: null,
  ...overrides,
});

// Helper function to create mock response object
export const createMockResponse = () => {
  const res: any = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
  };
  return res;
};

// Helper function to create mock next function
export const createMockNext = () => jest.fn();
