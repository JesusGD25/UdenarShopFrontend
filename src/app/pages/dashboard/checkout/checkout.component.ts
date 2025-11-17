import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartItem } from '../../../core/models/cart.model';
import { OrderService } from '../../../core/services/order.service';
import { CreateOrderDto, ProcessPaymentDto, PaymentMethod } from '../../../core/models/order.model';

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
    console.log('Cancelando checkout');
    if (!this.isProcessing) {
      this.closeCheckout.emit();
    }
  }

  async onSubmit(): Promise<void> {
    console.log('Iniciando proceso de pago');
    
    if (!this.validateForm()) {
      return;
    }

    this.isProcessing = true;
    this.errorMessage = '';

    try {
      // Simular proceso de pago sin llamar al servicio real
      console.log('Procesando pago con datos:', this.paymentData);
      console.log('Items del carrito:', this.cartItems);
      console.log('Total:', this.total);

      // Simular delay de procesamiento
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Emitir evento de pago confirmado
      const paymentResult = {
        orderId: Date.now(), // Simular ID de orden
        cardNumber: '****' + this.paymentData.cardNumber.slice(-4),
        amount: this.total,
        timestamp: new Date(),
        shippingAddress: {
          address: this.paymentData.address,
          city: this.paymentData.city,
          postalCode: this.paymentData.postalCode
        }
      };

      console.log('Pago procesado exitosamente:', paymentResult);
      this.confirmPayment.emit(paymentResult);

    } catch (error: any) {
      console.error('Error en el proceso de pago:', error);
      this.errorMessage = 'Error al procesar el pago. Por favor, intenta nuevamente.';
    } finally {
      this.isProcessing = false;
    }
  }

  validateForm(): boolean {
    const { cardNumber, cardHolder, expiryDate, cvv, email, address, city } = this.paymentData;
    
    console.log('Validando formulario:', this.paymentData);

    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 13) {
      this.errorMessage = 'Número de tarjeta inválido (mínimo 13 dígitos)';
      return false;
    }
    
    if (!cardHolder || cardHolder.trim().length < 2) {
      this.errorMessage = 'Nombre del titular inválido';
      return false;
    }
    
    if (!expiryDate || !/^\d{2}\/\d{2}$/.test(expiryDate)) {
      this.errorMessage = 'Fecha de expiración inválida (MM/YY)';
      return false;
    }
    
    if (!cvv || cvv.length < 3) {
      this.errorMessage = 'CVV inválido';
      return false;
    }
    
    if (!email || !email.includes('@')) {
      this.errorMessage = 'Email inválido';
      return false;
    }

    if (!address || address.trim().length < 5) {
      this.errorMessage = 'Dirección inválida';
      return false;
    }

    if (!city || city.trim().length < 2) {
      this.errorMessage = 'Ciudad inválida';
      return false;
    }
    
    console.log('Formulario válido');
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
