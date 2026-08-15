/**
 * Order Entity Model - B2B2C Gated Order Fulfillment Pipeline
 * Status Lifecycle: Pending -> Packed (Store Owner) -> Out_for_Delivery (Super Admin) -> Delivered (Super Admin)
 */

export type OrderStatus = 'Pending' | 'Packed' | 'Out_for_Delivery' | 'Delivered' | 'Cancelled';

export interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  imageUrl?: string;
  isGatedExclusive: boolean;
}

export interface CustomerSummary {
  id: string;
  name: string;
  email: string;
  phone: string;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'VIP_BLACK';
}

export interface ShippingAddress {
  recipientName: string;
  street: string;
  suite?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface LogisticsTracking {
  carrierName?: string;
  trackingNumber?: string;
  estimatedDeliveryDate?: string;
  dispatchedAt?: string;
  deliveredAt?: string;
  driverName?: string;
  driverPhone?: string;
  shippingNotes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  storeId: string;
  storeName: string;
  customer: CustomerSummary;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  status: OrderStatus;
  paymentStatus: 'PAID' | 'REFUNDED' | 'FAILED' | 'PENDING';
  logistics: LogisticsTracking;
  packedAt?: string;
  packedByUserId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateOrderStatusDto {
  status: OrderStatus;
  carrierName?: string;
  trackingNumber?: string;
  driverName?: string;
  notes?: string;
}
