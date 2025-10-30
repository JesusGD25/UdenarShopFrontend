import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  phone = '';
  errorMessage = '';
  isLoading = false;
  passwordMismatch = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(event: Event) {
    event.preventDefault();

    // Reset error messages
    this.errorMessage = '';
    this.passwordMismatch = false;

    // Validación básica
    if (!this.name || !this.email || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Por favor, complete todos los campos obligatorios';
      return;
    }

    // Validar que las contraseñas coincidan
    if (this.password !== this.confirmPassword) {
      this.passwordMismatch = true;
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    // Validar longitud mínima de contraseña
    if (this.password.length < 6) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }

    // Validar formato de contraseña (mayúscula, minúscula, número)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(this.password)) {
      this.errorMessage = 'La contraseña debe incluir al menos una mayúscula, una minúscula y un número';
      return;
    }

    this.isLoading = true;

    const registerData: RegisterRequest = {
      name: this.name,
      email: this.email,
      password: this.password,
    };

    // Agregar teléfono si se proporcionó
    if (this.phone) {
      registerData.phone = this.phone;
    }

    this.authService.register(registerData).subscribe({
      next: (response) => {
        console.log('Registro exitoso:', response);
        this.isLoading = false;
        
        // Redirigir al dashboard (ya está autenticado con el token)
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Error en registro:', error);
        this.isLoading = false;
        
        // Mostrar mensaje de error apropiado
        if (error.status === 409) {
          this.errorMessage = 'El email ya está registrado. Intenta con otro email o inicia sesión.';
        } else if (error.status === 400) {
          // Errores de validación del backend
          if (error.error?.message && Array.isArray(error.error.message)) {
            this.errorMessage = error.error.message.join('. ');
          } else {
            this.errorMessage = error.error?.message || 'Datos inválidos';
          }
        } else if (error.status === 0) {
          this.errorMessage = 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.';
        } else {
          this.errorMessage = 'Error al registrarse. Intente nuevamente.';
        }
      },
    });
  }
}
