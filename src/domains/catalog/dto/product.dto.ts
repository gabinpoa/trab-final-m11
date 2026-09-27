export interface CreateProductDto {
  name: string;
  description?: string;
  price: number;
  complexity?: number;
  categoryId: string;
  imageUrl: string;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  complexity?: number;
  categoryId?: string;
  imageUrl?: string;
}

export interface ProductResponseDto {
  id: string;
  name: string;
  description: string | null;
  price: number;
  complexity: number;
  imageUrl: string;
  categoryId: string;
  category: {
    id: string;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
