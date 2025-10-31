import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService, Product } from '../../../services/product.service';
import { CategoryService } from '../../../services/category.service';
import type { Category } from '../../../services/category.service';
import { LucideAngularModule, icons } from 'lucide-angular';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LucideAngularModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  searchQuery: string = '';
  recentProducts: Product[] = [];
  popularProducts: Product[] = [];
  categories: Category[] = [];
  isLoading: boolean = true;
  readonly icons = icons;

  // Categorías rápidas para el hero
  quickCategories = [
    { name: 'Libros', icon: '📚', id: '' },
    { name: 'Electrónica', icon: '💻', id: '' },
    { name: 'Ropa', icon: '👕', id: '' },
    { name: 'Deportes', icon: '⚽', id: '' },
  ];

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadHomeData();
  }

  loadHomeData(): void {
    this.isLoading = true;

    // Cargar productos recientes
    this.productService.getRecentProducts(8).subscribe({
      next: (products) => {
        this.recentProducts = products;
      },
      error: (error) => console.error('Error loading recent products:', error)
    });

    // Cargar productos populares
    this.productService.getPopularProducts(8).subscribe({
      next: (products) => {
        this.popularProducts = products;
      },
      error: (error) => console.error('Error loading popular products:', error)
    });

    // Cargar categorías
    this.categoryService.getActiveCategories().subscribe({
      next: (categories) => {
        this.categories = categories.slice(0, 6); // Solo primeras 6
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/dashboard/explore'], {
        queryParams: { search: this.searchQuery }
      });
    }
  }

  goToExplore(): void {
    this.router.navigate(['/dashboard/explore']);
  }

  goToCategory(categoryId: string): void {
    this.router.navigate(['/dashboard/explore'], {
      queryParams: { categories: categoryId }
    });
  }

  viewProduct(productId: string): void {
    this.router.navigate(['/dashboard/products', productId]);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  }

  getConditionLabel(condition: string): string {
    const conditions: { [key: string]: string } = {
      'NEW': 'Nuevo',
      'LIKE_NEW': 'Como nuevo',
      'USED': 'Usado'
    };
    return conditions[condition] || condition;
  }

  getLucideIcon(iconName: string | null | undefined): any {
    if (!iconName) return null;
    return (this.icons as any)[iconName];
  }
}

