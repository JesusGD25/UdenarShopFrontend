import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductService, Product } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import type { Category } from '../../services/category.service';
import { debounceTime, Subject } from 'rxjs';
import { LucideAngularModule, icons } from 'lucide-angular';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent implements OnInit {
  // Lucide icons
  readonly icons = icons;
  // Parámetros de búsqueda
  searchTerm: string = '';
  selectedCategories: string[] = [];
  minPrice: number | null = null;
  maxPrice: number | null = null;
  selectedCondition: string = '';
  sortBy: string = 'relevant';

  // Resultados y estado
  products: Product[] = [];
  categories: Category[] = [];
  isLoading: boolean = false;
  total: number = 0;
  currentPage: number = 1;
  totalPages: number = 0;
  limit: number = 12;

  // Subject para debounce en búsqueda
  private searchSubject = new Subject<string>();

  // Opciones de ordenamiento
  sortOptions = [
    { value: 'relevant', label: 'Más relevantes' },
    { value: 'recent', label: 'Más recientes' },
    { value: 'price_asc', label: 'Precio: menor a mayor' },
    { value: 'price_desc', label: 'Precio: mayor a menor' }
  ];

  // Opciones de condición
  conditionOptions = [
    { value: '', label: 'Todas las condiciones' },
    { value: 'NEW', label: 'Nuevo' },
    { value: 'LIKE_NEW', label: 'Como nuevo' },
    { value: 'USED', label: 'Usado' }
  ];

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Configurar debounce para búsqueda en tiempo real
    this.searchSubject.pipe(
      debounceTime(500) // Esperar 500ms después de que el usuario deje de escribir
    ).subscribe(searchTerm => {
      this.searchTerm = searchTerm;
      this.currentPage = 1;
      this.performSearch();
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    
    // Leer query params
    this.route.queryParams.subscribe(params => {
      if (params['search']) {
        this.searchTerm = params['search'];
      }
      if (params['categories']) {
        const categories = Array.isArray(params['categories']) 
          ? params['categories'] 
          : [params['categories']];
        this.selectedCategories = categories;
      }
      this.performSearch();
    });
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  toggleCategory(categoryId: string): void {
    const index = this.selectedCategories.indexOf(categoryId);
    if (index > -1) {
      this.selectedCategories.splice(index, 1);
    } else {
      this.selectedCategories.push(categoryId);
    }
    this.currentPage = 1;
    this.performSearch();
  }

  isCategorySelected(categoryId: string): boolean {
    return this.selectedCategories.includes(categoryId);
  }

  onPriceChange(): void {
    this.currentPage = 1;
    this.performSearch();
  }

  onConditionChange(): void {
    this.currentPage = 1;
    this.performSearch();
  }

  onSortChange(): void {
    this.currentPage = 1;
    this.performSearch();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategories = [];
    this.minPrice = null;
    this.maxPrice = null;
    this.selectedCondition = '';
    this.sortBy = 'relevant';
    this.currentPage = 1;
    this.performSearch();
  }

  performSearch(): void {
    this.isLoading = true;

    const searchParams: any = {
      page: this.currentPage,
      limit: this.limit,
      sortBy: this.sortBy
    };

    if (this.searchTerm && this.searchTerm.trim()) {
      searchParams.search = this.searchTerm.trim();
    }

    if (this.selectedCategories.length > 0) {
      searchParams.categories = this.selectedCategories;
    }

    if (this.minPrice !== null && this.minPrice > 0) {
      searchParams.minPrice = this.minPrice;
    }

    if (this.maxPrice !== null && this.maxPrice > 0) {
      searchParams.maxPrice = this.maxPrice;
    }

    if (this.selectedCondition) {
      searchParams.condition = this.selectedCondition;
    }

    this.productService.searchProducts(searchParams).subscribe({
      next: (response) => {
        this.products = response.products;
        this.total = response.total;
        this.totalPages = response.totalPages;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error searching products:', error);
        this.isLoading = false;
      }
    });
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.performSearch();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.performSearch();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.performSearch();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  viewProduct(productId: string): void {
    this.router.navigate(['/products', productId]);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  }

  getConditionLabel(condition: string): string {
    const option = this.conditionOptions.find(opt => opt.value === condition);
    return option ? option.label : condition;
  }

  getShortDescription(description: string): string {
    if (!description) return '';
    const maxLength = 120;
    return description.length > maxLength 
      ? description.substring(0, maxLength) + '...' 
      : description;
  }

  get hasActiveFilters(): boolean {
    return this.searchTerm.length > 0 ||
           this.selectedCategories.length > 0 ||
           this.minPrice !== null ||
           this.maxPrice !== null ||
           this.selectedCondition !== '';
  }

  getLucideIcon(iconName: string | null | undefined): any {
    if (!iconName) return null;
    return (this.icons as any)[iconName] || null;
  }
}
