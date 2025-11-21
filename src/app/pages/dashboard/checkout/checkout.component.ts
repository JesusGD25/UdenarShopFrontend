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
      // Construir dirección de envío
      const shippingAddress = `${this.paymentData.address}, ${this.paymentData.city}${this.paymentData.postalCode ? ', ' + this.paymentData.postalCode : ''}`;

      // Paso 1: Crear la orden
      console.log('Creando orden...');
      const createOrderDto: CreateOrderDto = {
        paymentMethod: PaymentMethod.CARD,
        shippingAddress: shippingAddress,
        notes: this.paymentData.notes || undefined
      };

      const order = await this.orderService.createOrder(createOrderDto).toPromise();
      console.log('Orden creada exitosamente:', order);

      if (!order) {
        throw new Error('Error al crear la orden');
      }

      // Paso 2: Procesar el pago
      console.log('Procesando pago para orden:', order.id);
      const processPaymentDto: ProcessPaymentDto = {
        paymentMethod: PaymentMethod.CARD,
        cardNumber: this.paymentData.cardNumber.replace(/\s/g, ''),
        cvv: this.paymentData.cvv,
        expiryDate: this.paymentData.expiryDate
      };

      const paidOrder = await this.orderService.processPayment(order.id, processPaymentDto).toPromise();
      console.log('Pago procesado exitosamente:', paidOrder);

      // Emitir evento de pago confirmado con la orden real
      const paymentResult = {
        orderId: order.id,
        order: paidOrder,
        cardNumber: '****' + this.paymentData.cardNumber.slice(-4),
        amount: this.total,
        timestamp: new Date(),
        shippingAddress: {
          address: this.paymentData.address,
          city: this.paymentData.city,
          postalCode: this.paymentData.postalCode
        }
      };

      console.log('Emitiendo confirmación de pago:', paymentResult);
      this.confirmPayment.emit(paymentResult);

    } catch (error: any) {
      console.error('Error en el proceso de pago:', error);
      const errorMsg = error?.error?.message || error?.message || 'Error al procesar el pago';
      this.errorMessage = errorMsg;
      alert(`❌ Error: ${errorMsg}`);
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
