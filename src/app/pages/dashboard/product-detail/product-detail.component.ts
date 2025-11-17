import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService, Product, ProductCondition } from '../../../services/product.service';
import { CategoryService, Category } from '../../../services/category.service';
import { AuthService } from '../../../services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { Subject, takeUntil } from 'rxjs';
import { 
  LucideAngularModule, 
  ArrowLeft, 
  Edit, 
  Trash2, 
  ShoppingCart, 
  MessageSquare, 
  Heart,
  Share2,
  MapPin,
  Package,
  CheckCircle,
  XCircle,
  Tag
} from 'lucide-angular';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss'
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  // Icons
  readonly ArrowLeft = ArrowLeft;
  readonly Edit = Edit;
  readonly Trash2 = Trash2;
  readonly ShoppingCart = ShoppingCart;
  readonly MessageSquare = MessageSquare;
  readonly Heart = Heart;
  readonly Share2 = Share2;
  readonly MapPin = MapPin;
  readonly Package = Package;
  readonly CheckCircle = CheckCircle;
  readonly XCircle = XCircle;
  readonly Tag = Tag;

  product: Product | null = null;
  category: Category | null = null;
  isLoading = true;
  error: string | null = null;
  currentImageIndex = 0;
  showDeleteModal = false;
  isDeleting = false;
  
  // Agregar propiedades para el carrito
  isAddingToCart = false;
  private destroy$ = new Subject<void>();

  // User info
  currentUserId: string | null = null;
  isAdmin = false;
  isOwner = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private categoryService: CategoryService,
    private authService: AuthService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    // Obtener info del usuario actual
    const user = this.authService.getCurrentUser();
    this.currentUserId = user?.id || null;
    this.isAdmin = this.authService.isAdmin();

    // Obtener ID del producto de la ruta
    const productId = this.route.snapshot.paramMap.get('id');
    
    // Validar que no sea una ruta especial como 'add', 'edit', etc.
    if (productId && productId !== 'add' && productId !== 'edit') {
      this.loadProduct(productId);
    } else {
      this.error = 'ID de producto no válido';
      this.isLoading = false;
      // Redirigir a productos después de 2 segundos
      setTimeout(() => {
        this.router.navigate(['/dashboard/products']);
      }, 2000);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Cargar producto
   */
  loadProduct(id: string): void {
    this.isLoading = true;
    this.error = null;

    this.productService.getProduct(id).subscribe({
      next: (product) => {
        this.product = product;
        this.isOwner = this.currentUserId === product.seller?.id;
        
        // Cargar categoría si existe
        if (product.category?.id) {
          this.loadCategory(product.category.id);
        } else {
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.error('Error loading product:', err);
        this.error = 'No se pudo cargar el producto';
        this.isLoading = false;
      }
    });
  }

  /**
   * Cargar categoría
   */
  loadCategory(categoryId: string): void {
    this.categoryService.getCategory(categoryId).subscribe({
      next: (category) => {
        this.category = category;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading category:', err);
        this.isLoading = false;
      }
    });
  }

  /**
   * Volver atrás
   */
  goBack(): void {
    this.router.navigate(['/dashboard/products']);
  }

  /**
   * Editar producto
   */
  editProduct(): void {
    if (this.product) {
      this.router.navigate(['/dashboard/products/edit', this.product.id]);
    }
  }

  /**
   * Abrir modal de eliminar
   */
  openDeleteModal(): void {
    this.showDeleteModal = true;
  }

  /**
   * Cerrar modal de eliminar
   */
  closeDeleteModal(): void {
    this.showDeleteModal = false;
  }

  /**
   * Eliminar producto
   */
  deleteProduct(): void {
    if (!this.product) return;

    this.isDeleting = true;
    this.error = null;

    this.productService.deleteProduct(this.product.id).subscribe({
      next: () => {
        // Redirigir a mis productos o productos según el usuario
        if (this.isOwner) {
          this.router.navigate(['/dashboard/my-products']);
        } else {
          this.router.navigate(['/dashboard/products']);
        }
      },
      error: (err) => {
        console.error('Error deleting product:', err);
        this.error = 'No se pudo eliminar el producto';
        this.isDeleting = false;
        this.closeDeleteModal();
      }
    });
  }

  /**
   * Cambiar imagen actual
   */
  changeImage(index: number): void {
    if (this.product?.images && index >= 0 && index < this.product.images.length) {
      this.currentImageIndex = index;
    }
  }

  /**
   * Imagen anterior
   */
  previousImage(): void {
    if (this.product?.images) {
      this.currentImageIndex = 
        (this.currentImageIndex - 1 + this.product.images.length) % this.product.images.length;
    }
  }

  /**
   * Imagen siguiente
   */
  nextImage(): void {
    if (this.product?.images) {
      this.currentImageIndex = 
        (this.currentImageIndex + 1) % this.product.images.length;
    }
  }

  /**
   * Obtener label de condición
   */
  getConditionLabel(condition?: ProductCondition): string {
    switch (condition) {
      case ProductCondition.NEW:
        return 'Nuevo';
      case ProductCondition.USED:
        return 'Usado';
      case ProductCondition.LIKE_NEW:
        return 'Como Nuevo';
      default:
        return 'Sin especificar';
    }
  }

  /**
   * Formatear precio a COP
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  }

  /**
   * Compartir producto (placeholder)
   */
  shareProduct(): void {
    if (navigator.share && this.product) {
      navigator.share({
        title: this.product.title,
        text: this.product.description || '',
        url: window.location.href
      }).catch(err => console.log('Error sharing:', err));
    } else {
      // Copiar URL al portapapeles
      navigator.clipboard.writeText(window.location.href);
      alert('¡Enlace copiado al portapapeles!');
    }
  }

  /**
   * Agregar al carrito
   */
  addToCart(): void {
    if (!this.product) return;

    // Validar que el producto esté disponible
    if (this.product.isSold) {
      alert('❌ Este producto ya está vendido');
      return;
    }

    if (!this.product.isActive) {
      alert('❌ Este producto no está disponible');
      return;
    }

    if (this.product.stock <= 0) {
      alert('❌ Producto sin stock disponible');
      return;
    }

    // Agregar al carrito
    this.isAddingToCart = true;
    this.error = null;

    this.cartService.addToCart({
      productId: this.product.id,
      quantity: 1
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (cart) => {
        this.isAddingToCart = false;
        alert('✅ Producto agregado al carrito correctamente');
        
        // Opcional: Preguntar si quiere ir al carrito
        const goToCart = confirm('¿Deseas ir al carrito ahora?');
        if (goToCart) {
          this.router.navigate(['/dashboard/cart']); // Cambiar a /dashboard/cart
        }
      },
      error: (err) => {
        console.error('Error adding to cart:', err);
        this.isAddingToCart = false;
        
        // Manejar errores específicos del backend
        let errorMessage = 'Error al agregar el producto al carrito';
        
        if (err.error?.message) {
          errorMessage = err.error.message;
        } else if (err.status === 400) {
          errorMessage = 'No se puede agregar este producto al carrito';
        } else if (err.status === 404) {
          errorMessage = 'Producto no encontrado';
        } else if (err.status === 401) {
          errorMessage = 'Debes iniciar sesión para agregar productos al carrito';
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 2000);
        }
        
        alert(`❌ ${errorMessage}`);
      }
    });
  }

  /**
   * Enviar mensaje al vendedor (placeholder)
   */
  contactSeller(): void {
    // TODO: Implementar mensajería
    console.log('Contactar vendedor:', this.product?.seller?.id);
    alert('Funcionalidad de mensajes próximamente');
  }

  /**
   * Agregar a favoritos (placeholder)
   */
  addToFavorites(): void {
    // TODO: Implementar favoritos
    console.log('Agregar a favoritos:', this.product?.id);
    alert('Funcionalidad de favoritos próximamente');
  }
}
