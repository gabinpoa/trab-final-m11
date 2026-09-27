export interface CreateCustomizationDto {
  orderId: string;
  comment?: string;
}

export interface CustomizationResponseDto {
  id: string;
  orderId: string;
  filename: string;
  originalPath: string;
  thumbnailPath: string;
  compressedPath: string;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomizationUploadResponseDto {
  id: string;
  orderId: string;
  filename: string;
  originalUrl: string;
  thumbnailUrl: string;
  compressedUrl: string;
  comment?: string;
  createdAt: Date;
}
