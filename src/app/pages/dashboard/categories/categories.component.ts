import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService, Category, CreateCategoryDto, UpdateCategoryDto } from '../../../services/category.service';
import { LucideAngularModule, Plus, Edit, Trash2, Check, X, Search, RefreshCw, icons } from 'lucide-angular';
import { IconPickerComponent } from '../../../shared/icon-picker/icon-picker.component';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, IconPickerComponent],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss'
})
export class CategoriesComponent implements OnInit {
  // Icons
  readonly Plus = Plus;
  readonly Edit = Edit;
  readonly Trash2 = Trash2;
  readonly Check = Check;
  readonly X = X;
  readonly Search = Search;
  readonly RefreshCw = RefreshCw;
  readonly icons = icons;

  categories: Category[] = [];
  filteredCategories: Category[] = [];
  isLoading = false;
  error: string | null = null;
  successMessage: string | null = null;
  searchTerm = '';

  // Modal states
  showCreateModal = false;
  showEditModal = false;
  showDeleteModal = false;
  selectedCategory: Category | null = null;

  // Form data
  categoryForm: CreateCategoryDto = {
    name: '',
    description: '',
    iconUrl: '',
    isActive: true
  };

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  /**
   * Cargar todas las categorías
   */
  loadCategories(): void {
    this.isLoading = true;
    this.error = null;

    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.filteredCategories = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar las categorías';
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  /**
   * Filtrar categorías por búsqueda
   */
  filterCategories(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredCategories = this.categories;
      return;
    }

    this.filteredCategories = this.categories.filter(cat =>
      cat.name.toLowerCase().includes(term) ||
      cat.description?.toLowerCase().includes(term) ||
      cat.slug?.toLowerCase().includes(term)
    );
  }

  /**
   * Abrir modal de crear
   */
  openCreateModal(): void {
    this.categoryForm = {
      name: '',
      description: '',
      iconUrl: '',
      isActive: true
    };
    this.showCreateModal = true;
    this.error = null;
  }

  /**
   * Cerrar modal de crear
   */
  closeCreateModal(): void {
    this.showCreateModal = false;
    this.categoryForm = {
      name: '',
      description: '',
      iconUrl: '',
      isActive: true
    };
  }

  /**
   * Crear nueva categoría
   */
  createCategory(): void {
    if (!this.categoryForm.name.trim()) {
      this.error = 'El nombre es requerido';
      return;
    }

    this.isLoading = true;
    this.error = null;

    this.categoryService.createCategory(this.categoryForm).subscribe({
      next: (newCategory) => {
        this.categories.unshift(newCategory);
        this.filterCategories();
        this.showSuccessMessage('Categoría creada exitosamente');
        this.closeCreateModal();
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al crear la categoría';
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  /**
   * Abrir modal de editar
   */
  openEditModal(category: Category): void {
    this.selectedCategory = category;
    this.categoryForm = {
      name: category.name,
      description: category.description || '',
      iconUrl: category.iconUrl || '',
      isActive: category.isActive
    };
    this.showEditModal = true;
    this.error = null;
  }

  /**
   * Cerrar modal de editar
   */
  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedCategory = null;
    this.categoryForm = {
      name: '',
      description: '',
      iconUrl: '',
      isActive: true
    };
  }

  /**
   * Actualizar categoría
   */
  updateCategory(): void {
    if (!this.selectedCategory || !this.categoryForm.name.trim()) {
      this.error = 'El nombre es requerido';
      return;
    }

    this.isLoading = true;
    this.error = null;

    const updateData: UpdateCategoryDto = {
      name: this.categoryForm.name,
      description: this.categoryForm.description,
      iconUrl: this.categoryForm.iconUrl,
      isActive: this.categoryForm.isActive
    };

    this.categoryService.updateCategory(this.selectedCategory.id, updateData).subscribe({
      next: (updatedCategory) => {
        const index = this.categories.findIndex(c => c.id === updatedCategory.id);
        if (index !== -1) {
          this.categories[index] = updatedCategory;
        }
        this.filterCategories();
        this.showSuccessMessage('Categoría actualizada exitosamente');
        this.closeEditModal();
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al actualizar la categoría';
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  /**
   * Abrir modal de eliminar
   */
  openDeleteModal(category: Category): void {
    this.selectedCategory = category;
    this.showDeleteModal = true;
    this.error = null;
  }

  /**
   * Cerrar modal de eliminar
   */
  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedCategory = null;
  }

  /**
   * Eliminar (desactivar) categoría
   */
  deleteCategory(): void {
    if (!this.selectedCategory) return;

    this.isLoading = true;
    this.error = null;

    this.categoryService.deleteCategory(this.selectedCategory.id).subscribe({
      next: () => {
        // Actualizar el estado de isActive en lugar de eliminar
        const index = this.categories.findIndex(c => c.id === this.selectedCategory!.id);
        if (index !== -1) {
          this.categories[index].isActive = false;
        }
        this.filterCategories();
        this.showSuccessMessage('Categoría desactivada exitosamente');
        this.closeDeleteModal();
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al desactivar la categoría';
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  /**
   * Activar categoría
   */
  activateCategory(category: Category): void {
    this.isLoading = true;
    this.error = null;

    this.categoryService.activateCategory(category.id).subscribe({
      next: (activatedCategory) => {
        const index = this.categories.findIndex(c => c.id === activatedCategory.id);
        if (index !== -1) {
          this.categories[index] = activatedCategory;
        }
        this.filterCategories();
        this.showSuccessMessage('Categoría activada exitosamente');
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al activar la categoría';
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  /**
   * Mostrar mensaje de éxito temporal
   */
  showSuccessMessage(message: string): void {
    this.successMessage = message;
    setTimeout(() => {
      this.successMessage = null;
    }, 3000);
  }

  /**
   * Obtener emoji por defecto según el nombre
   */
  getDefaultIcon(name: string): string {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('electr')) return '⚡';
    if (lowerName.includes('ropa') || lowerName.includes('moda')) return '👕';
    if (lowerName.includes('hogar') || lowerName.includes('casa')) return '🏠';
    if (lowerName.includes('deport')) return '⚽';
    if (lowerName.includes('libro')) return '📚';
    if (lowerName.includes('juguete')) return '🧸';
    if (lowerName.includes('music')) return '🎵';
    if (lowerName.includes('vehiculo') || lowerName.includes('auto')) return '🚗';
    return '📦';
  }

  /**
   * Manejar selección de ícono
   */
  onIconSelected(iconName: string): void {
    this.categoryForm.iconUrl = iconName;
  }

  /**
   * Obtener ícono de Lucide por nombre
   */
  getLucideIcon(iconName: string | null | undefined): any {
    if (!iconName) return null;
    return (this.icons as any)[iconName];
  }
}
