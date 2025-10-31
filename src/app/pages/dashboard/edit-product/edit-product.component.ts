import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductFormComponent, ProductFormData } from '../../../components/product-form/product-form.component';
import { ProductService, UpdateProductDto, ProductCondition } from '../../../services/product.service';

@Component({
  selector: 'app-edit-product',
  standalone: true,
  imports: [CommonModule, ProductFormComponent],
  templateUrl: './edit-product.component.html',
  styleUrl: './edit-product.component.scss'
})
export class EditProductComponent implements OnInit {
  productId: string = '';
  productData?: ProductFormData;
  isLoading = false;
  error: string | null = null;
  success: string | null = null;

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id') || '';
    if (this.productId) {
      this.loadProduct();
    }
  }

  private loadProduct(): void {
    this.isLoading = true;
    this.productService.getProduct(this.productId).subscribe({
      next: (product) => {
        // Transformar el producto al formato del formulario
        this.productData = {
          id: product.id,
          title: product.title,
          description: product.description,
          price: product.price,
          condition: product.condition as ProductCondition,
          images: product.images || [],
          stock: product.stock,
          categoryId: product.categoryId || ''
        };
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar producto:', error);
        this.error = 'No se pudo cargar el producto';
        this.isLoading = false;
      }
    });
  }

  onSubmit(productData: any): void {
    this.isLoading = true;
    this.error = null;
    this.success = null;

    this.productService.updateProduct(this.productId, productData as UpdateProductDto).subscribe({
      next: (product) => {
        console.log('Producto actualizado:', product);
        this.success = 'Producto actualizado exitosamente';
        this.isLoading = false;
        
        // Redirigir después de 1.5 segundos
        setTimeout(() => {
          this.router.navigate(['/dashboard/products']);
        }, 1500);
      },
      error: (error) => {
        console.error('Error al actualizar producto:', error);
        this.error = error.error?.message || 'Error al actualizar el producto';
        this.isLoading = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/dashboard/products']);
  }
}
