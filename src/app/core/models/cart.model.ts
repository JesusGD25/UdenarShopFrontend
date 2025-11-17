import { Product } from './product.model';

export interface CartItem {
  id: number; // Mantener como number
  productId: string;
  quantity: number;
  product: Product;
}

export interface Cart {
  id: number;
  userId: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

export interface AddToCartDto {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemDto {
  quantity: number;
}

export interface CartTotal {
  total: number;
}
