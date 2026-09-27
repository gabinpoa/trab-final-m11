export interface SagaStep {
  name: string;
  execute: (context: SagaContext) => Promise<void>;
  compensate: (context: SagaContext) => Promise<void>;
}

export interface SagaContext {
  orderId?: string;
  userId: string;
  items: OrderItem[];
  cep: string;
  freight?: number;
  deliveryDate?: Date;
  total?: number;
  materialReservations?: MaterialReservation[];
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'compensating';
  error?: Error;
  completedSteps: string[];
  failedStep?: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface MaterialReservation {
  materialId: string;
  quantity: number;
  originalVersion: number;
}

export interface SagaResult {
  success: boolean;
  orderId?: string;
  error?: string;
}
