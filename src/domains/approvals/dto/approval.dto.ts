export interface CreateApprovalDto {
  orderId: string;
  status: 'approved' | 'rejected';
  rejectionReason?: string;
}

export interface ApprovalResponseDto {
  id: string;
  orderId: string;
  status: string;
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApproveOrderDto {
  orderId: string;
  approvedBy: string;
}

export interface RejectOrderDto {
  orderId: string;
  approvedBy: string;
  rejectionReason: string;
}
