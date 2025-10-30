import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard para proteger rutas que solo pueden acceder administradores
 * 
 * Uso en routes:
 * { path: 'admin', component: AdminComponent, canActivate: [authGuard, adminGuard] }
 */
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAdmin()) {
    return true;
  }

  // Si no es admin, redirigir al dashboard
  console.warn('Acceso denegado: Se requieren permisos de administrador');
  router.navigate(['/dashboard']);
  
  return false;
};
