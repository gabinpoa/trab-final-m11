export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  complexity: number;
  category: string;
  imageUrl?: string;
  stock: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface Order {
  id: string;
  userId: string;
  status: string;
  total: number;
  freight?: number;
  deliveryDate?: string;
  trackingCode?: string;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName?: string;
  quantity: number;
  price: number;
}

export interface Customization {
  id: string;
  orderId: string;
  filename: string;
  paths?: {
    original: string;
    thumbnail: string;
    compressed: string;
  };
  comment?: string;
  thumbnailUrl?: string;
  originalUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}
