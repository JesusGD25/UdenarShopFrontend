import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  constructor(
    private authService: AuthService, 
    private router: Router
  ) {}

  onSubmit(event: Event) {
    event.preventDefault();

    // Validación básica
    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor, complete todos los campos';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (response) => {
        console.log('Login exitoso:', response);
        this.isLoading = false;
        // Redirigir al dashboard
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Error en login:', error);
        this.isLoading = false;
        
        // Mostrar mensaje de error apropiado
        if (error.status === 401) {
          this.errorMessage = error.error?.message || 'Credenciales inválidas';
        } else if (error.status === 0) {
          this.errorMessage = 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.';
        } else {
          this.errorMessage = 'Error al iniciar sesión. Intente nuevamente.';
        }
      },
    });
  }
}
