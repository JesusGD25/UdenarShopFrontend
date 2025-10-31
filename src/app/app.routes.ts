import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AddProductComponent } from './pages/dashboard/add-product/add-product.component';
import { EditProductComponent } from './pages/dashboard/edit-product/edit-product.component';
import { ProductDetailComponent } from './pages/dashboard/product-detail/product-detail.component';
import { HomeComponent } from './pages/dashboard/home/home.component';
import { MyProductsComponent } from './pages/dashboard/my-products/my-products.component';
import { CategoriesComponent } from './pages/dashboard/categories/categories.component';
import { SearchComponent } from './pages/search/search.component';
import { authGuard } from './guards/auth.guard';
import { loginGuard } from './guards/login.guard';

export const routes: Routes = [
  // Ruta por defecto: dashboard
  { 
    path: '', 
    redirectTo: 'dashboard', 
    pathMatch: 'full' 
  },
  
  // Ruta de login (solo accesible si NO está autenticado)
  { 
    path: 'login', 
    component: LoginComponent,
    canActivate: [loginGuard]
  },

  // Ruta de registro (solo accesible si NO está autenticado)
  { 
    path: 'register', 
    component: RegisterComponent,
    canActivate: [loginGuard]
  },
  
  // Rutas protegidas del dashboard (requieren autenticación)
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [authGuard],
    children: [
      { 
        path: '', 
        component: HomeComponent 
      },
      { 
        path: 'explore', 
        component: SearchComponent 
      },
      { 
        path: 'products/add', 
        component: AddProductComponent 
      },
      { 
        path: 'products/edit/:id', 
        component: EditProductComponent 
      },
      { 
        path: 'products/:id', 
        component: ProductDetailComponent 
      },
      { 
        path: 'my-products', 
        component: MyProductsComponent 
      },
      { 
        path: 'categories', 
        component: CategoriesComponent 
      }
    ] 
  },

  // Ruta wildcard para 404
  { 
    path: '**', 
    redirectTo: 'dashboard' 
  }
];
