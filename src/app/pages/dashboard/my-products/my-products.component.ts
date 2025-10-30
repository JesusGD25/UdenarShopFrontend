import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductCardComponent } from '../../../shared/product-card/product-card.component';
import { ProductService, Product } from '../../../services/product.service';

@Component({
  selector: 'app-my-products',
  imports: [CommonModule, ProductCardComponent],
  templateUrl: './my-products.component.html',
  styleUrl: './my-products.component.scss'
})
export class MyProductsComponent implements OnInit {
  products: Product[] = [];
  currentPage = 1;
  pageSize = 10;
  totalProducts = 0;
  totalPages = 0;
  isLoading = false;
  error: string | null = null;

  constructor(
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMyProducts();
  }

  loadMyProducts(page: number = 1): void {
    this.isLoading = true;
    this.error = null;
    
    this.productService.getMyProducts(page, this.pageSize).subscribe({
      next: (response) => {
        this.products = response.products;
        this.totalProducts = response.total;
        this.totalPages = Math.ceil(response.total / this.pageSize);
        this.currentPage = page;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Error al cargar tus productos. Por favor, intente nuevamente.';
        this.isLoading = false;
        console.error('Error loading my products:', error);
      }
    });
  }

  editProduct(id: string): void {
    this.router.navigate(['/dashboard/products/edit', id]);
  }

  deleteProduct(id: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          // Recargar la lista después de eliminar
          this.loadMyProducts(this.currentPage);
        },
        error: (error) => {
          console.error('Error al eliminar producto:', error);
          alert('Error al eliminar el producto. Por favor, intente nuevamente.');
        }
      });
    }
  }

  navigateToAddProduct(): void {
    this.router.navigate(['/dashboard/products/add']);
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.loadMyProducts(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.loadMyProducts(this.currentPage + 1);
    }
  }

  goToPage(page: number): void {
    this.loadMyProducts(page);
  }
}
