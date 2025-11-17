import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CartService } from '../../../core/services/cart.service';
import { Cart, CartItem } from '../../../core/models/cart.model';
import { CheckoutComponent } from '../checkout/checkout.component';

@Component({
  selector: 'app-my-cart',
  standalone: true,
  templateUrl: './my-cart.component.html',
  styleUrls: ['./my-cart.component.scss'],
  imports: [CommonModule, DecimalPipe, RouterLink, CheckoutComponent]
})
export class MyCartComponent implements OnInit, OnDestroy {
  cart: Cart | null = null;
  isLoading = false;
  error: string | null = null;
  private destroy$ = new Subject<void>();
  showCheckout = false;

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
    this.loadCart();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCart(): void {
    this.isLoading = true;
    this.error = null;
    
    this.cartService.getCart()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (cart) => {
          this.cart = cart;
          this.isLoading = false;
        },
        error: (err) => {
          this.error = 'Error al cargar el carrito';
          this.isLoading = false;
          console.error('Error loading cart:', err);
        }
      });
  }

  get cartItems(): CartItem[] {
    return this.cart?.items || [];
  }

  getTotalPrice(): number {
    return this.cart ? this.cart.items.reduce((sum: number, item: CartItem) =>
      sum + (item.product.price * item.quantity), 0
    ) : 0;
  }

  getItemSubtotal(item: CartItem): number {
    return item.product.price * item.quantity;
  }

  // Alias para compatibilidad con el template
  getSubtotal(item: CartItem): number {
    return this.getItemSubtotal(item);
  }

  // Getter para el total
  get total(): number {
    return this.getTotalPrice();
  }

  getPrice(priceValue: number): number {
    return priceValue;
  }

  // Método para actualizar cantidad (alias)
  actualizarCantidad(itemId: number, change: number): void {
    const item = this.cartItems.find(i => i.id === itemId);
    if (item) {
      const newQuantity = item.quantity + change;
      this.updateQuantity(item, newQuantity);
    }
  }

  updateQuantity(item: CartItem, newQuantity: number): void {
    if (newQuantity < 1) return;
    
    if (item.product.stock && newQuantity > item.product.stock) {
      alert(`Stock máximo disponible: ${item.product.stock}`);
      return;
    }

    this.isLoading = true;
    this.error = null;
    
    this.cartService.updateCartItem(item.id.toString(), { quantity: newQuantity })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (cart) => {
          this.cart = cart;
          this.isLoading = false;
        },
        error: (err) => {
          this.error = 'Error al actualizar la cantidad';
          this.isLoading = false;
          console.error('Error updating cart item:', err);
          alert('❌ Error al actualizar la cantidad');
        }
      });
  }

  eliminarItem(itemId: number): void {
    if (!confirm('¿Estás seguro de eliminar este producto del carrito?')) {
      return;
    }

    this.isLoading = true;
    this.error = null;
    
    this.cartService.removeCartItem(itemId.toString())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (cart) => {
          this.cart = cart;
          this.isLoading = false;
        },
        error: (err) => {
          this.error = 'Error al eliminar el item';
          this.isLoading = false;
          console.error('Error removing cart item:', err);
          alert('❌ Error al eliminar el producto');
        }
      });
  }

  vaciarCarrito(): void {
    if (!confirm('¿Estás seguro de vaciar todo el carrito?')) {
      return;
    }

    this.isLoading = true;
    this.error = null;
    
    this.cartService.clearCart()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (cart) => {
          this.cart = cart;
          this.isLoading = false;
        },
        error: (err) => {
          this.error = 'Error al vaciar el carrito';
          this.isLoading = false;
          console.error('Error clearing cart:', err);
          alert('❌ Error al vaciar el carrito');
        }
      });
  }

  finalizarCompra(): void {
    console.log('=== INICIANDO PROCESO DE COMPRA ===');
    console.log('Cart items:', this.cartItems);
    console.log('Total:', this.total);
    console.log('Show checkout before:', this.showCheckout);
    
    if (!this.cart || this.cartItems.length === 0) {
      alert('El carrito está vacío');
      return;
    }
    
    if (this.isLoading) {
      alert('Espera a que termine la operación actual');
      return;
    }
    
    this.showCheckout = true;
    console.log('Show checkout after:', this.showCheckout);
  }

  cerrarCheckout(): void {
    console.log('=== CERRANDO CHECKOUT ===');
    this.showCheckout = false;
  }

  procesarPago(paymentData: any): void {
    console.log('=== PROCESANDO PAGO ===');
    console.log('Payment data recibida:', paymentData);
    
    // Mostrar mensaje de éxito
    alert(`¡Pago procesado exitosamente! ✅
    
Número de orden: ${paymentData.orderId}
Total pagado: $${paymentData.amount}
Tarjeta: ${paymentData.cardNumber}

¡Gracias por tu compra!`);
    
    // Cerrar checkout primero
    this.showCheckout = false;
    
    // Luego vaciar el carrito
    setTimeout(() => {
      this.vaciarCarrito();
    }, 500);
  }
}
