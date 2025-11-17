export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  condition: string;
  images: string[];
  stock?: number;
  isSold: boolean;
  rating: string;
  totalReviews: number;
  viewsCount: number;
  likesCount: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
  categoryId?: string;
  category?: {
    id: string;
    name: string;
    slug: string;
    description?: string;
  };
}

export interface CreateProductDto {
  title: string;
  description: string;
  price: number;
  stock: number;
  condition: string;
  categoryId: string;
}

export interface UpdateProductDto {
  title?: string;
  description?: string;
  price?: number;
  stock?: number;
  condition?: string;
  categoryId?: string;
  isActive?: boolean;
}
