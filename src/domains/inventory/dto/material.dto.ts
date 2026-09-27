export interface CreateMaterialDto {
  name: string;
  quantity: number;
  minLevel?: number;
}

export interface UpdateMaterialDto {
  name?: string;
  quantity?: number;
  minLevel?: number;
}

export interface MaterialResponseDto {
  id: string;
  name: string;
  quantity: number;
  minLevel: number;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}
