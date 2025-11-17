export interface CartItem {
  id: string;
  quantity: number;
  createdAt: Date;
  cartId: string;
  productId: string;
  product: {
    id: string;
    title: string;
    slug: string;
    description: string;
    price: string; // El backend envía como string
    condition: string;
    images: string[];
    stock: number;
    isSold: boolean;
    rating: string;
    totalReviews: number;
    viewsCount: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    sellerId: string;
    categoryId: string;
    category?: {
      id: string;
      name: string;
      slug: string;
      description: string;
      iconUrl: string;
      isActive: boolean;
      createdAt: Date;
    };
  };
}

export interface Cart {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  items: CartItem[];
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
