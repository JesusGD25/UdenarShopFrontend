import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
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
  access_token: string;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:3000/auth';
  private tokenKey = 'access_token';
  private userKey = 'user';
  
  // BehaviorSubject para manejar el estado de autenticación reactivamente
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Cargar usuario y token desde localStorage al inicializar
    this.loadAuthFromStorage();
  }

  /**
   * Realiza el login del usuario
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          this.setAuthData(response.access_token, response.user);
        })
      );
  }

  /**
   * Registra un nuevo usuario
   */
  register(data: RegisterRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/register`, data)
      .pipe(
        tap(response => {
          this.setAuthData(response.access_token, response.user);
        })
      );
  }

  /**
   * Cierra la sesión del usuario
   */
  logout(): void {
    this.clearAuthData();
    this.router.navigate(['/login']);
  }

  /**
   * Obtiene el usuario actual
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Obtiene el token JWT
   */
  getToken(): string | null {
    const token = localStorage.getItem(this.tokenKey);
    
    if (!token) {
      return null;
    }
    
    // Verificar si el token existe y no está expirado
    if (this.isTokenExpired(token)) {
      console.warn('Token expirado, cerrando sesión...');
      this.clearAuthData();
      return null;
    }
    
    return token;
  }

  /**
   * Verifica si un token JWT está expirado
   */
  private isTokenExpired(token: string): boolean {
    try {
      // Decodificar el payload del JWT (parte del medio)
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      // exp viene en segundos, Date.now() está en milisegundos
      const expirationTime = payload.exp * 1000;
      const currentTime = Date.now();
      
      return currentTime >= expirationTime;
    } catch (error) {
      console.error('Error al verificar expiración del token:', error);
      return true; // Si hay error al decodificar, considerar expirado
    }
  }

  /**
   * Verifica si hay un usuario autenticado
   */
  isLoggedIn(): boolean {
    return !!this.getToken() && !!this.currentUserSubject.value;
  }

  /**
   * Verifica si el usuario tiene un rol específico
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  /**
   * Verifica si el usuario es admin
   */
  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  /**
   * Verifica el token en el servidor
   */
  verifyToken(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/verify`);
  }

  /**
   * Obtiene el perfil del usuario autenticado
   */
  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`);
  }

  /**
   * Guarda los datos de autenticación
   */
  private setAuthData(token: string, user: User): void {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  /**
   * Limpia los datos de autenticación
   */
  private clearAuthData(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
  }

  /**
   * Carga el usuario y token desde localStorage
   */
  private loadAuthFromStorage(): void {
    const token = localStorage.getItem(this.tokenKey);
    const userStr = localStorage.getItem(this.userKey);
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error al cargar datos de autenticación:', error);
        this.clearAuthData();
      }
    }
  }
}
