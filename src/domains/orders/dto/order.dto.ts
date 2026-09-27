export interface CreateOrderDto {
  userId: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  freight?: number;
}

export interface UpdateOrderDto {
  status?: string;
  freight?: number;
  deliveryDate?: Date;
}

export interface OrderResponseDto {
  id: string;
  userId: string;
  status: string;
  total: number;
  freight: number | null;
  deliveryDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  items: Array<{
    id: string;
    productId: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      name: string;
      price: number;
    };
  }>;
}
