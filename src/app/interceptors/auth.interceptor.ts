import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpInterceptor, HttpHandler } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, throwError, Observable } from 'rxjs';

/**
 * Interceptor basado en clase para agregar el token JWT a todas las peticiones HTTP
 * Este enfoque es más confiable en Angular 19 que los interceptores funcionales
 */
@Injectable()
export class AuthInterceptorClass implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('🔥 INTERCEPTOR CLASE EJECUTÁNDOSE para:', req.method, req.url);
    
    const token = this.authService.getToken();

    if (token) {
      console.log('✅ Token encontrado, agregando header Authorization');
      console.log('📝 Token:', token.substring(0, 30) + '...');
      
      const clonedRequest = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('📤 Headers clonados:', clonedRequest.headers.keys());
      console.log('📤 Authorization header:', clonedRequest.headers.get('Authorization')?.substring(0, 30) + '...');
      
      return next.handle(clonedRequest).pipe(
        catchError((error) => {
          console.error('❌ Error en la petición HTTP:', error);
          
          if (error.status === 401) {
            console.warn('🚪 Token inválido o expirado. Cerrando sesión...');
            this.authService.logout();
            this.router.navigate(['/auth/login']);
          }
          return throwError(() => error);
        })
      );
    }

    console.log('⚠️ No hay token, petición sin autenticación');
    return next.handle(req);
  }
}

/**
 * Interceptor funcional (mantener por compatibilidad)
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  console.log('🔥 INTERCEPTOR FUNCIONAL EJECUTÁNDOSE para:', req.method, req.url);
  
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  if (token) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return next(clonedRequest).pipe(
      catchError((error) => {
        if (error.status === 401) {
          authService.logout();
          router.navigate(['/auth/login']);
        }
        return throwError(() => error);
      })
    );
  }

  return next(req);
};
