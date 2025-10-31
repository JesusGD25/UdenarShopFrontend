import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { 
  LucideAngularModule, 
  Home, 
  Store, 
  Package, 
  PlusCircle, 
  MessageSquare, 
  Heart, 
  ShoppingCart, 
  User, 
  LogOut,
  Search,
  TrendingUp,
  FolderOpen
} from 'lucide-angular';
import { AuthService } from '../../services/auth.service';

interface MenuItem {
  label: string;
  route: string;
  icon: any;
  exact?: boolean;
  adminOnly?: boolean;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent implements OnInit {
  readonly Home = Home;
  readonly Store = Store;
  readonly Package = Package;
  readonly PlusCircle = PlusCircle;
  readonly MessageSquare = MessageSquare;
  readonly Heart = Heart;
  readonly ShoppingCart = ShoppingCart;
  readonly User = User;
  readonly LogOut = LogOut;
  readonly Search = Search;
  readonly TrendingUp = TrendingUp;
  readonly FolderOpen = FolderOpen;

  menuSections: MenuSection[] = [];
  isAdmin = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.buildMenu();
  }

  buildMenu(): void {
    this.menuSections = [
      {
        title: 'Principal',
        items: [
          { label: 'Inicio', route: '/dashboard', icon: this.Home, exact: true },
          { label: 'Explorar', route: '/dashboard/explore', icon: this.Search }
        ]
      },
      {
        title: 'Mis Ventas',
        items: [
          { label: 'Mis Productos', route: '/dashboard/my-products', icon: this.Package },
          { label: 'Publicar Producto', route: '/dashboard/products/add', icon: this.PlusCircle }
        ]
      },
      {
        title: 'Actividad',
        items: [
          { label: 'Mensajes', route: '/dashboard/messages', icon: this.MessageSquare },
          { label: 'Favoritos', route: '/dashboard/favorites', icon: this.Heart },
          { label: 'Mi Carrito', route: '/dashboard/cart', icon: this.ShoppingCart }
        ]
      }
    ];

    // Agregar sección de administración solo para admins
    if (this.isAdmin) {
      this.menuSections.push({
        title: 'Administración',
        items: [
          { label: 'Categorías', route: '/dashboard/categories', icon: this.FolderOpen, adminOnly: true }
        ]
      });
    }
  }

  logout(): void {
    // Usar el método del servicio que limpia token, usuario y redirige
    this.authService.logout();
  }
}
