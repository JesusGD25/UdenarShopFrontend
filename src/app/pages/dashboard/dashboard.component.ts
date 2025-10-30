import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { AuthService, User } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, SidebarComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  private userSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Suscribirse a cambios en el usuario autenticado
    this.userSubscription = this.authService.currentUser$.subscribe({
      next: (user) => {
        this.currentUser = user;
        
        // Si el usuario se desautentica (logout), ya no hacer nada
        // El guard se encargará de redirigir
        if (!user) {
          console.log('Usuario desautenticado');
        }
      }
    });
  }

  ngOnDestroy(): void {
    // Limpiar suscripción para evitar memory leaks
    this.userSubscription?.unsubscribe();
  }

  logout(): void {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
      this.authService.logout();
    }
  }

  /**
   * Verifica si el usuario es administrador
   */
  isAdmin(): boolean {
    return this.authService.isAdmin();
  }
}
