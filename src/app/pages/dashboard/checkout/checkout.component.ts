import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartItem } from '../../../core/models/cart.model';
import { OrderService } from '../../../core/services/order.service';
import { PaymentMethod } from '../../../core/models/order.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent {
  @Input() cartItems: CartItem[] = [];
  @Input() total: number = 0;
  @Output() closeCheckout = new EventEmitter<void>();
  @Output() confirmPayment = new EventEmitter<any>();

  paymentData = {
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    notes: ''
  };

  isProcessing = false;
  errorMessage: string = '';

  constructor(private orderService: OrderService) {}

  onCancel(): void {
    if (!this.isProcessing) {
      this.closeCheckout.emit();
    }
  }

  async onSubmit(): Promise<void> {
    if (!this.validateForm()) {
      return;
    }

    this.isProcessing = true;
    this.errorMessage = '';

    try {
      // 1. Crear la orden
      const shippingAddress = `${this.paymentData.address}, ${this.paymentData.city}${this.paymentData.postalCode ? ', ' + this.paymentData.postalCode : ''}`;
      
      const order = await this.orderService.createOrder({
        paymentMethod: PaymentMethod.CARD,
        shippingAddress,
        notes: this.paymentData.notes
      }).toPromise();

      if (!order) {
        throw new Error('Error al crear la orden');
      }

      // 2. Procesar el pago
      const paidOrder = await this.orderService.processPayment(order.id, {
        paymentMethod: PaymentMethod.CARD,
        cardNumber: this.paymentData.cardNumber,
        cvv: this.paymentData.cvv,
        expiryDate: this.paymentData.expiryDate
      }).toPromise();

      // 3. Emitir evento de éxito
      this.confirmPayment.emit({
        order: paidOrder,
        timestamp: new Date()
      });

      alert(`¡Pago exitoso! Número de orden: ${paidOrder?.orderNumber}`);
      this.closeCheckout.emit();

    } catch (error: any) {
      console.error('Error en el proceso de pago:', error);
      this.errorMessage = error.error?.message || 'Error al procesar el pago. Por favor, intenta nuevamente.';
      alert(this.errorMessage);
    } finally {
      this.isProcessing = false;
    }
  }

  validateForm(): boolean {
    const { cardNumber, cardHolder, expiryDate, cvv, email, address, city } = this.paymentData;
    
    if (!cardNumber || cardNumber.length < 16) {
      this.errorMessage = 'Número de tarjeta inválido';
      alert(this.errorMessage);
      return false;
    }
    
    if (!cardHolder || cardHolder.trim().length < 3) {
      this.errorMessage = 'Nombre del titular inválido';
      alert(this.errorMessage);
      return false;
    }
    
    if (!expiryDate || !/^\d{2}\/\d{2}$/.test(expiryDate)) {
      this.errorMessage = 'Fecha de expiración inválida (MM/YY)';
      alert(this.errorMessage);
      return false;
    }
    
    if (!cvv || cvv.length < 3) {
      this.errorMessage = 'CVV inválido';
      alert(this.errorMessage);
      return false;
    }
    
    if (!email || !email.includes('@')) {
      this.errorMessage = 'Email inválido';
      alert(this.errorMessage);
      return false;
    }

    if (!address || address.trim().length < 5) {
      this.errorMessage = 'Dirección inválida';
      alert(this.errorMessage);
      return false;
    }

    if (!city || city.trim().length < 2) {
      this.errorMessage = 'Ciudad inválida';
      alert(this.errorMessage);
      return false;
    }
    
    return true;
  }

  formatCardNumber(event: any): void {
    let value = event.target.value.replace(/\s/g, '');
    if (value.length > 16) {
      value = value.substring(0, 16);
    }
    this.paymentData.cardNumber = value;
  }

  formatExpiryDate(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    this.paymentData.expiryDate = value;
  }

  formatCVV(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 4) {
      value = value.substring(0, 4);
    }
    this.paymentData.cvv = value;
  }

  getPrice(price: any): number {
    return typeof price === 'number' ? price : parseFloat(price) || 0;
  }

  getItemSubtotal(item: CartItem): number {
    return this.getPrice(item.product.price) * item.quantity;
  }
}
