import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Category } from './category.service';

export enum ProductCondition {
  NEW = 'new',
  USED = 'used',
  LIKE_NEW = 'like_new'
}

// DTO para crear producto
export interface CreateProductDto {
  title: string;
  description?: string;
  price: number;
  condition?: ProductCondition;
  images?: string[];
  stock?: number;
  categoryId: string;
}

// DTO para actualizar producto
export interface UpdateProductDto {
  title?: string;
  description?: string;
  price?: number;
  condition?: ProductCondition;
  images?: string[];
  stock?: number;
  categoryId?: string;
  isSold?: boolean;
}

// Interfaz que usamos en nuestra aplicación
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  condition: ProductCondition;
  images: string[];
  stock: number;
  isSold: boolean;
  rating: number;
  totalReviews: number;
  viewsCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  sellerId: string;
  categoryId: string;
  seller?: User;
  category?: Category;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
}

export interface SearchProductsParams {
  search?: string;
  categories?: string[];
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}

export interface SearchProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:3000/products';
  private defaultLimit = 10;

  constructor(private http: HttpClient) { }

  getProducts(page: number = 1): Observable<ProductsResponse> {
    const offset = (page - 1) * this.defaultLimit;
    
    let params = new HttpParams()
      .set('limit', this.defaultLimit.toString())
      .set('offset', offset.toString());

    return this.http.get<Product[]>(this.apiUrl, { params }).pipe(
      map((products: Product[]) => ({
        products: products,
        total: products.length
      }))
    );
  }

  getProductsWithPagination(paginationParams?: PaginationParams): Observable<ProductsResponse> {
    let params = new HttpParams();
    
    if (paginationParams?.limit) {
      params = params.set('limit', paginationParams.limit.toString());
    }
    
    if (paginationParams?.offset !== undefined) {
      params = params.set('offset', paginationParams.offset.toString());
    }

    return this.http.get<Product[]>(this.apiUrl, { params }).pipe(
      map((products: Product[]) => ({
        products: products,
        total: products.length
      }))
    );
  }

  /**
   * Crea un nuevo producto
   */
  createProduct(productData: CreateProductDto): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}`, productData);
  }

  /**
   * Actualiza un producto existente
   */
  updateProduct(term: string, productData: UpdateProductDto): Observable<Product> {
    return this.http.patch<Product>(`${this.apiUrl}/${term}`, productData);
  }

  /**
   * Elimina un producto
   */
  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtiene un producto por ID o slug
   */
  getProduct(term: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${term}`);
  }

  /**
   * Obtiene productos del usuario autenticado
   */
  getMyProducts(page: number = 1, pageSize: number = 10): Observable<ProductsResponse> {
    const offset = (page - 1) * pageSize;
    const params = new HttpParams()
      .set('limit', pageSize.toString())
      .set('offset', offset.toString());

    return this.http.get<Product[]>(`${this.apiUrl}/my-products`, { params }).pipe(
      map((products: Product[]) => ({
        products: products,
        total: products.length
      }))
    );
  }

  /**
   * Búsqueda avanzada de productos con filtros
   */
  searchProducts(searchParams: SearchProductsParams): Observable<SearchProductsResponse> {
    let params = new HttpParams();

    if (searchParams.search) {
      params = params.set('search', searchParams.search);
    }

    if (searchParams.categories && searchParams.categories.length > 0) {
      searchParams.categories.forEach(cat => {
        params = params.append('categories', cat);
      });
    }

    if (searchParams.minPrice !== undefined && searchParams.minPrice !== null) {
      params = params.set('minPrice', searchParams.minPrice.toString());
    }

    if (searchParams.maxPrice !== undefined && searchParams.maxPrice !== null) {
      params = params.set('maxPrice', searchParams.maxPrice.toString());
    }

    if (searchParams.condition) {
      params = params.set('condition', searchParams.condition);
    }

    if (searchParams.sortBy) {
      params = params.set('sortBy', searchParams.sortBy);
    }

    if (searchParams.page) {
      params = params.set('page', searchParams.page.toString());
    }

    if (searchParams.limit) {
      params = params.set('limit', searchParams.limit.toString());
    }

    return this.http.get<SearchProductsResponse>(`${this.apiUrl}/search`, { params });
  }

  /**
   * Obtiene productos recientes
   */
  getRecentProducts(limit: number = 8): Observable<Product[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<Product[]>(`${this.apiUrl}/recent`, { params });
  }

  /**
   * Obtiene productos populares
   */
  getPopularProducts(limit: number = 8): Observable<Product[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<Product[]>(`${this.apiUrl}/popular`, { params });
  }
}