export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  category?: string;
  stock?: number;
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
