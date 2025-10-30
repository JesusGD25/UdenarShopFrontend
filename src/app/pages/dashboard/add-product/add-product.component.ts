import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ProductFormComponent } from '../../../components/product-form/product-form.component';
import { ProductService, CreateProductDto } from '../../../services/product.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, ProductFormComponent],
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.scss'
})
export class AddProductComponent {
  isLoading = false;
  error: string | null = null;
  success: string | null = null;

  constructor(
    private productService: ProductService,
    private router: Router
  ) {}

  onSubmit(productData: any): void {
    this.isLoading = true;
    this.error = null;
    this.success = null;

    this.productService.createProduct(productData as CreateProductDto).subscribe({
      next: (product) => {
        console.log('Producto creado:', product);
        this.success = 'Producto creado exitosamente';
        this.isLoading = false;
        
        // Redirigir después de 1.5 segundos
        setTimeout(() => {
          this.router.navigate(['/dashboard/products']);
        }, 1500);
      },
      error: (error) => {
        console.error('Error al crear producto:', error);
        this.error = error.error?.message || 'Error al crear el producto';
        this.isLoading = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/dashboard/products']);
  }
}
