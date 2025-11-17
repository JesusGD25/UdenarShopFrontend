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

  get total(): number {
    if (!this.cart || !this.cart.items) return 0;
    return this.cart.items.reduce((sum, item) => 
      sum + (parseFloat(item.product.price) * item.quantity), 0
    );
  }

  getSubtotal(item: CartItem): number {
    return parseFloat(item.product.price) * item.quantity;
  }

  getPrice(priceString: string): number {
    return parseFloat(priceString);
  }

  actualizarCantidad(itemId: string, cambio: number): void {
    const item = this.cartItems.find(i => i.id === itemId);
    if (!item) return;

    const newQuantity = item.quantity + cambio;

    if (newQuantity <= 0) {
      this.eliminarItem(itemId);
      return;
    }

    if (newQuantity > item.product.stock) {
      alert(`Stock máximo disponible: ${item.product.stock}`);
      return;
    }

    this.isLoading = true;
    this.error = null;
    
    this.cartService.updateCartItem(itemId, { quantity: newQuantity })
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

  eliminarItem(itemId: string): void {
    if (!confirm('¿Estás seguro de eliminar este producto del carrito?')) {
      return;
    }

    this.isLoading = true;
    this.error = null;
    
    this.cartService.removeCartItem(itemId)
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
    if (this.cartItems.length === 0) {
      alert('El carrito está vacío');
      return;
    }
    this.showCheckout = true;
  }

  cerrarCheckout(): void {
    this.showCheckout = false;
  }

  procesarPago(paymentData: any): void {
    console.log('Procesando pago:', paymentData);
    
    // Aquí puedes agregar la lógica para enviar la orden al backend
    alert('¡Pago procesado exitosamente! ✅\n\nGracias por tu compra.');
    
    // Vaciar el carrito después del pago
    this.vaciarCarrito();
    this.showCheckout = false;
  }
}
