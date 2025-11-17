import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Cart, AddToCartDto, UpdateCartItemDto } from '../models/cart.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = `${environment.apiUrl}/cart`; // Quitar /api
  private cartSubject = new BehaviorSubject<Cart | null>(null);
  public cart$ = this.cartSubject.asObservable();

  constructor(private http: HttpClient) {
    console.log('🛒 Cart Service initialized');
    console.log('📍 Cart API URL:', this.apiUrl);
  }

  /**
   * Obtener el carrito actual del usuario
   */
  getCart(): Observable<Cart> {
    console.log('📥 Getting cart from:', this.apiUrl);
    return this.http.get<Cart>(this.apiUrl).pipe(
      tap(cart => {
        console.log('✅ Cart loaded:', cart);
        this.cartSubject.next(cart);
      }),
      catchError(err => {
        console.error('❌ Error getting cart:', err);
        throw err;
      })
    );
  }

  /**
   * Agregar producto al carrito
   */
  addToCart(addToCartDto: AddToCartDto): Observable<Cart> {
    console.log('➕ Adding to cart:', addToCartDto);
    console.log('📍 POST URL:', `${this.apiUrl}/add`);
    
    return this.http.post<Cart>(`${this.apiUrl}/add`, addToCartDto).pipe(
      tap(cart => {
        console.log('✅ Product added to cart:', cart);
        this.cartSubject.next(cart);
      }),
      catchError(err => {
        console.error('❌ Error adding to cart:', err);
        console.error('Error status:', err.status);
        console.error('Error message:', err.message);
        console.error('Error body:', err.error);
        throw err;
      })
    );
  }

  /**
   * Actualizar cantidad de un item
   */
  updateCartItem(itemId: string, updateDto: UpdateCartItemDto): Observable<Cart> {
    return this.http.patch<Cart>(`${this.apiUrl}/items/${itemId}`, updateDto).pipe(
      tap(cart => this.cartSubject.next(cart))
    );
  }

  /**
   * Eliminar item del carrito
   */
  removeCartItem(itemId: string): Observable<Cart> {
    return this.http.delete<Cart>(`${this.apiUrl}/items/${itemId}`).pipe(
      tap(cart => this.cartSubject.next(cart))
    );
  }

  /**
   * Vaciar el carrito
   */
  clearCart(): Observable<Cart> {
    return this.http.delete<Cart>(`${this.apiUrl}/clear`).pipe(
      tap(cart => this.cartSubject.next(cart))
    );
  }

  /**
   * Obtener total del carrito
   */
  getCartTotal(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/total`);
  }

  /**
   * Obtener cantidad de items en el carrito
   */
  getItemCount(): number {
    const cart = this.cartSubject.value;
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  }
}
