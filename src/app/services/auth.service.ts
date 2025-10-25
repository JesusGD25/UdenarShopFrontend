import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  avatarUrl?: string;
  phone?: string;
}

export interface LoginResponse {
  message: string;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:3000/auth';
  private currentUser: User | null = null;

  constructor(private http: HttpClient) {
    // Cargar usuario desde localStorage al inicializar el servicio
    this.loadUserFromStorage();
  }

  /**
   * Realiza el login del usuario
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          this.currentUser = response.user;
          localStorage.setItem('user', JSON.stringify(response.user));
        })
      );
  }

  /**
   * Cierra la sesión del usuario
   */
  logout(): void {
    this.currentUser = null;
    localStorage.removeItem('user');
  }

  /**
   * Obtiene el usuario actual
   */
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Verifica si hay un usuario autenticado
   */
  isLoggedIn(): boolean {
    return !!this.currentUser;
  }

  /**
   * Carga el usuario desde localStorage
   */
  private loadUserFromStorage(): void {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        this.currentUser = JSON.parse(userStr);
      } catch (error) {
        console.error('Error al cargar usuario desde localStorage:', error);
        localStorage.removeItem('user');
      }
    }
  }
}
