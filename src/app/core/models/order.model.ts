export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  CANCELLED = 'cancelled',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered'
}

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  TRANSFER = 'transfer'
}

export interface CreateOrderDto {
  paymentMethod: PaymentMethod;
  shippingAddress: string;
  notes?: string;
}

export interface ProcessPaymentDto {
  paymentMethod: PaymentMethod;
  cardNumber?: string;
  cvv?: string;
  expiryDate?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productTitle: string;
  quantity: number;
  price: number;
  sellerId: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  shippingAddress: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  buyerId: string;
  items: OrderItem[];
}
