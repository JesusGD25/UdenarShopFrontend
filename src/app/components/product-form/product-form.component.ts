import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { ProductService, ProductCondition, CreateProductDto, UpdateProductDto } from '../../services/product.service';
import { CategoryService, Category } from '../../services/category.service';

export interface ProductFormData {
  id?: string;
  title: string;
  description?: string;
  price: number;
  condition?: ProductCondition;
  images?: string[];
  stock?: number;
  categoryId: string;
}

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss'
})
export class ProductFormComponent implements OnInit {
  @Input() productData?: ProductFormData;
  @Output() formSubmit = new EventEmitter<any>();
  @Output() formCancel = new EventEmitter<void>();

  productForm!: FormGroup;
  categories: Category[] = [];
  isLoading = false;
  error: string | null = null;
  imageInput = '';

  // Enums para el template
  ProductCondition = ProductCondition;
  conditionOptions = [
    { value: ProductCondition.NEW, label: 'Nuevo' },
    { value: ProductCondition.USED, label: 'Usado' },
    { value: ProductCondition.LIKE_NEW, label: 'Como nuevo' }
  ];

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadCategories();
    if (this.productData) {
      this.populateForm(this.productData);
    }
  }

  private initializeForm(): void {
    this.productForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      description: ['', [Validators.maxLength(2000)]],
      price: [null, [Validators.required, Validators.min(1000), Validators.max(999999999)]],
      condition: [ProductCondition.NEW],
      stock: [1, [Validators.required, Validators.min(0), Validators.max(10000)]],
      categoryId: ['', Validators.required],
      images: [[]]
    });
  }

  private populateForm(data: ProductFormData): void {
    this.productForm.patchValue({
      title: data.title,
      description: data.description || '',
      price: data.price,
      condition: data.condition || ProductCondition.NEW,
      stock: data.stock || 1,
      categoryId: data.categoryId,
      images: data.images || []
    });
  }

  private loadCategories(): void {
    this.isLoading = true;
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.error = 'Error al cargar las categorías';
        this.isLoading = false;
      }
    });
  }

  addImage(): void {
    const url = this.imageInput.trim();
    if (!url) return;

    const currentImages = this.productForm.get('images')?.value || [];
    
    if (currentImages.length >= 10) {
      this.error = 'Máximo 10 imágenes permitidas';
      return;
    }

    if (!this.isValidUrl(url)) {
      this.error = 'URL de imagen inválida';
      return;
    }

    this.productForm.patchValue({
      images: [...currentImages, url]
    });
    this.imageInput = '';
    this.error = null;
  }

  removeImage(index: number): void {
    const currentImages = this.productForm.get('images')?.value || [];
    currentImages.splice(index, 1);
    this.productForm.patchValue({ images: currentImages });
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const formValue = this.productForm.value;
    
    // Si hay imágenes vacías, filtrarlas
    if (formValue.images && formValue.images.length > 0) {
      formValue.images = formValue.images.filter((img: string) => img.trim() !== '');
    }

    this.formSubmit.emit(formValue);
  }

  onCancel(): void {
    this.formCancel.emit();
  }

  get isEditMode(): boolean {
    return !!this.productData?.id;
  }

  // Getters para validaciones en el template
  get title() { return this.productForm.get('title'); }
  get description() { return this.productForm.get('description'); }
  get price() { return this.productForm.get('price'); }
  get stock() { return this.productForm.get('stock'); }
  get categoryId() { return this.productForm.get('categoryId'); }
  get images() { return this.productForm.get('images')?.value || []; }
}
