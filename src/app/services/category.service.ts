import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Category {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  iconUrl?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  iconUrl?: string;
  isActive?: boolean;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  iconUrl?: string;
  isActive?: boolean;
}

export interface CategoryWithProducts extends Category {
  products: any[];
}

export interface CategoryCountResponse {
  categoryId: string;
  categoryName: string;
  productCount: number;
}

export interface PaginationDto {
  limit?: number;
  offset?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = 'http://localhost:3000/categories';

  constructor(private http: HttpClient) { }

  /**
   * Crear nueva categoría (Solo ADMIN)
   */
  createCategory(data: CreateCategoryDto): Observable<Category> {
    return this.http.post<Category>(this.apiUrl, data);
  }

  /**
   * Obtener todas las categorías (activas e inactivas)
   */
  getCategories(pagination?: PaginationDto): Observable<Category[]> {
    let params = new HttpParams();
    if (pagination?.limit) {
      params = params.set('limit', pagination.limit.toString());
    }
    if (pagination?.offset) {
      params = params.set('offset', pagination.offset.toString());
    }
    return this.http.get<Category[]>(this.apiUrl, { params });
  }

  /**
   * Obtener solo categorías activas
   */
  getActiveCategories(pagination?: PaginationDto): Observable<Category[]> {
    let params = new HttpParams();
    if (pagination?.limit) {
      params = params.set('limit', pagination.limit.toString());
    }
    if (pagination?.offset) {
      params = params.set('offset', pagination.offset.toString());
    }
    return this.http.get<Category[]>(`${this.apiUrl}/active`, { params });
  }

  /**
   * Obtener una categoría por ID o slug
   */
  getCategory(term: string): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${term}`);
  }

  /**
   * Obtener categoría con sus productos
   */
  getCategoryWithProducts(term: string): Observable<CategoryWithProducts> {
    return this.http.get<CategoryWithProducts>(`${this.apiUrl}/${term}/products`);
  }

  /**
   * Contar productos de una categoría
   */
  countCategoryProducts(id: string): Observable<CategoryCountResponse> {
    return this.http.get<CategoryCountResponse>(`${this.apiUrl}/${id}/count`);
  }

  /**
   * Actualizar categoría (Solo ADMIN)
   */
  updateCategory(id: string, data: UpdateCategoryDto): Observable<Category> {
    return this.http.patch<Category>(`${this.apiUrl}/${id}`, data);
  }

  /**
   * Activar categoría desactivada (Solo ADMIN)
   */
  activateCategory(id: string): Observable<Category> {
    return this.http.patch<Category>(`${this.apiUrl}/${id}/activate`, {});
  }

  /**
   * Eliminar (desactivar) categoría (Solo ADMIN)
   */
  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
