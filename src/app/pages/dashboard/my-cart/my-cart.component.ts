import { Component } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common'; // <-- Agrega esto
import { RouterLink } from '@angular/router'; // <-- Agrega esto

interface CartItem {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  imagen?: string;
}

@Component({
  selector: 'app-my-cart',
  standalone: true,
  templateUrl: './my-cart.component.html',
  styleUrls: ['./my-cart.component.scss'],
  imports: [CommonModule, DecimalPipe, RouterLink] // <-- Agrega esto
})
export class MyCartComponent {
  cartItems: CartItem[] = [];

  get total(): number {
    return this.cartItems.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  }

  actualizarCantidad(id: number, cambio: number) {
    const item = this.cartItems.find(item => item.id === id);
    if (item) {
      item.cantidad += cambio;
      if (item.cantidad <= 0) {
        this.eliminarItem(id);
      }
    }
  }

  eliminarItem(id: number) {
    this.cartItems = this.cartItems.filter(item => item.id !== id);
  }

  vaciarCarrito() {
    this.cartItems = [];
  }

  finalizarCompra() {
    // Aquí irá la lógica de finalizar compra
    alert('Funcionalidad de compra en desarrollo');
  }
}
