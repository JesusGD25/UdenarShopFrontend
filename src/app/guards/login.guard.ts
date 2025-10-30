import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard para la ruta de login
 * Si el usuario ya está autenticado, redirige al dashboard
 * 
 * Uso en routes:
 * { path: 'login', component: LoginComponent, canActivate: [loginGuard] }
 */
export const loginGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    // Si ya está autenticado, redirigir a dashboard
    router.navigate(['/dashboard']);
    return false;
  }

  // Si no está autenticado, permitir acceso a login
  return true;
};
