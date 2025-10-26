import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductCardComponent } from '../../../shared/product-card/product-card.component';
import { ProductService, Product } from '../../../services/product.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, ProductCardComponent, HttpClientModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  currentPage = 1;
  pageSize = 10;
  totalProducts = 0;
  totalPages = 0;
  isLoading = false;
  error: string | null = null;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(page: number = 1): void {
    this.isLoading = true;
    this.error = null;
    
    this.productService.getProducts(page).subscribe({
      next: (response) => {
        this.products = response.products;
        this.totalProducts = response.total;
        this.totalPages = Math.ceil(response.total / this.pageSize);
        this.currentPage = page;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar los productos. Por favor, intente nuevamente.';
        this.isLoading = false;
        console.error('Error loading products:', error);
      }
    });
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.loadProducts(this.currentPage + 1);
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.loadProducts(this.currentPage - 1);
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.loadProducts(page);
    }
  }


  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  }
}
