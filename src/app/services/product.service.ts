import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export enum ProductCondition {
  NEW = 'new',
  USED = 'used',
  LIKE_NEW = 'like_new'
}

// Interfaz que representa los datos tal como vienen del backend
export interface BackendProduct {
  id: string;
  title: string;
  slug?: string;
  description?: string;
  price: number;
  condition?: ProductCondition;
  images?: string[];
  stock?: number;
  isSold?: boolean;
  categoryId?: string;
  sellerId?: string;
  createdAt?: Date;
  updatedAt?: Date;
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
export interface Product {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  description: string;
  condition: ProductCondition;
  stock: number;
  isSold: boolean;
}

interface BackendResponse {
  products: BackendProduct[];
  total: number;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
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

  private transformProduct(product: BackendProduct): Product {
    return {
      id: product.id,
      name: product.title,
      imageUrl: product.images && product.images.length > 0 ? product.images[0] : '',
      price: product.price,
      description: product.description || '',
      condition: product.condition || ProductCondition.NEW,
      stock: product.stock || 0,
      isSold: product.isSold || false
    };
  }

  getProducts(page: number = 1): Observable<ProductsResponse> {
    const offset = (page - 1) * this.defaultLimit;
    
    let params = new HttpParams()
      .set('limit', this.defaultLimit.toString())
      .set('offset', offset.toString());

    return this.http.get(this.apiUrl, { params }).pipe(
      map(response => {
        console.log('Backend response:', response);
        
        // Si la respuesta es un array directamente, lo envolvemos en el formato esperado
        if (Array.isArray(response)) {
          return {
            products: response.map(product => this.transformProduct(product)),
            total: response.length
          };
        }
        
        // Si la respuesta ya tiene la estructura esperada
        const typedResponse = response as BackendResponse;
        return {
          products: typedResponse.products.map(product => this.transformProduct(product)),
          total: typedResponse.total
        };
      })
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

    return this.http.get(this.apiUrl, { params }).pipe(
      map(response => {
        console.log('Backend response:', response);
        
        // Si la respuesta es un array directamente, lo envolvemos en el formato esperado
        if (Array.isArray(response)) {
          return {
            products: response.map(product => this.transformProduct(product)),
            total: response.length
          };
        }
        
        // Si la respuesta ya tiene la estructura esperada
        const typedResponse = response as BackendResponse;
        return {
          products: typedResponse.products.map(product => this.transformProduct(product)),
          total: typedResponse.total
        };
      })
    );
  }

  /**
   * Crea un nuevo producto
   */
  createProduct(productData: CreateProductDto): Observable<Product> {
    return this.http
      .post<BackendProduct>(`${this.apiUrl}`, productData)
      .pipe(map((product) => this.transformProduct(product)));
  }

  /**
   * Actualiza un producto existente
   */
  updateProduct(term: string, productData: UpdateProductDto): Observable<Product> {
    return this.http
      .patch<BackendProduct>(`${this.apiUrl}/${term}`, productData)
      .pipe(map((product) => this.transformProduct(product)));
  }
  /**
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
    return this.http
      .get<BackendProduct>(`${this.apiUrl}/${term}`)
      .pipe(map((product) => this.transformProduct(product)));
  }

  /**
   * Obtiene productos del usuario autenticado
   */
  getMyProducts(page: number = 1, pageSize: number = 10): Observable<ProductsResponse> {
    const offset = (page - 1) * pageSize;
    const params = new HttpParams()
      .set('limit', pageSize.toString())
      .set('offset', offset.toString());

    return this.http.get(`${this.apiUrl}/my-products`, { params }).pipe(
      map(response => {
        if (Array.isArray(response)) {
          const products = response.map(product => this.transformProduct(product));
          return {
            products,
            total: products.length
          };
        }
        
        const typedResponse = response as BackendResponse;
        return {
          products: typedResponse.products.map(product => this.transformProduct(product)),
          total: typedResponse.total
        };
      })
    );
  }
}