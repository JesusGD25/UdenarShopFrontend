import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { ProductService, ProductCondition, CreateProductDto, UpdateProductDto } from '../../services/product.service';
import { CategoryService, Category } from '../../services/category.service';
import { UploadService } from '../../services/upload.service';
import { AiService } from '../../services/ai.service';

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
  isUploadingImages = false;
  uploadProgress: { [key: string]: number } = {};
  isGeneratingWithAi = false;
  aiSuccess: string | null = null;

  // Enums para el template
  ProductCondition = ProductCondition;
  conditionOptions = [
    { value: ProductCondition.NEW, label: 'Nuevo' },
    { value: ProductCondition.USED, label: 'Usado' },
    { value: ProductCondition.LIKE_NEW, label: 'Como nuevo' }
  ];

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private uploadService: UploadService,
    private aiService: AiService
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
      images: [[], [Validators.required, Validators.minLength(1)]]
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

  /**
   * Maneja la selección de archivos de imagen
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const files = Array.from(input.files);
    const currentImages = this.productForm.get('images')?.value || [];

    // Validar cantidad total
    if (currentImages.length + files.length > 5) {
      this.error = 'Máximo 5 imágenes permitidas';
      input.value = ''; // Limpiar input
      return;
    }

    // Validar cada archivo
    for (const file of files) {
      const validationError = this.uploadService.getValidationError(file);
      if (validationError) {
        this.error = validationError;
        input.value = '';
        return;
      }
    }

    // Subir las imágenes
    this.uploadImages(files);
    input.value = ''; // Limpiar input
  }

  /**
   * Sube las imágenes a Cloudinary
   */
  private uploadImages(files: File[]): void {
    this.isUploadingImages = true;
    this.error = null;

    // Subir cada imagen individualmente para mejor control
    const uploadPromises = files.map(file => {
      return this.uploadService.uploadImage(file).toPromise();
    });

    Promise.all(uploadPromises)
      .then(results => {
        const currentImages = this.productForm.get('images')?.value || [];
        const newUrls = results.map(result => result!.url);
        
        this.productForm.patchValue({
          images: [...currentImages, ...newUrls]
        });

        this.isUploadingImages = false;
        console.log('✅ Imágenes subidas:', newUrls);
      })
      .catch(error => {
        console.error('Error uploading images:', error);
        this.error = 'Error al subir las imágenes. Por favor, intente nuevamente.';
        this.isUploadingImages = false;
      });
  }

  removeImage(index: number): void {
    const currentImages = this.productForm.get('images')?.value || [];
    currentImages.splice(index, 1);
    this.productForm.patchValue({ images: currentImages });
  }

  /**
   * Genera una descripción mejorada usando IA
   */
  generateWithAi(): void {
    const title = this.productForm.get('title')?.value;
    
    if (!title || title.trim().length < 3) {
      this.error = 'Debes escribir un título primero para generar la descripción con IA';
      return;
    }

    this.isGeneratingWithAi = true;
    this.error = null;
    this.aiSuccess = null;

    const categoryId = this.productForm.get('categoryId')?.value;
    const categoryName = this.categories.find(c => c.id === categoryId)?.name;
    const currentDescription = this.productForm.get('description')?.value;
    const price = this.productForm.get('price')?.value;
    const images = this.productForm.get('images')?.value || [];

    // Filtrar solo las URLs válidas (imágenes ya subidas)
    const validImages = images.filter((img: string) => img && img.startsWith('http'));

    this.aiService.generateDescription({
      title,
      currentDescription,
      categoryName,
      price,
      images: validImages.length > 0 ? validImages : undefined
    }).subscribe({
      next: (response) => {
        this.productForm.patchValue({
          description: response.description
        });
        
        const imageInfo = validImages.length > 0 
          ? ` (analizando ${validImages.length} imagen${validImages.length > 1 ? 'es' : ''})` 
          : '';
        
        this.aiSuccess = `✨ Descripción generada exitosamente con IA${imageInfo}`;
        this.isGeneratingWithAi = false;
        
        // Limpiar mensaje de éxito después de 5 segundos
        setTimeout(() => {
          this.aiSuccess = null;
        }, 5000);
      },
      error: (error) => {
        console.error('Error generating description:', error);
        this.error = error.error?.message || 'No se pudo generar la descripción con IA. Intenta nuevamente.';
        this.isGeneratingWithAi = false;
      }
    });
  }

  onSubmit(): void {
    // Validar que haya al menos una imagen
    const images = this.productForm.get('images')?.value || [];
    if (images.length === 0) {
      this.error = 'Debes subir al menos una imagen del producto';
      this.productForm.get('images')?.setErrors({ required: true });
      return;
    }

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
  
  // Getter para verificar si hay imágenes subidas
  get hasUploadedImages(): boolean {
    const imgs = this.productForm.get('images')?.value || [];
    return imgs.filter((img: string) => img && img.startsWith('http')).length > 0;
  }
}
