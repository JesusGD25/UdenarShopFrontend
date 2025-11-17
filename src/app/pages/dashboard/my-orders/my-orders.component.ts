import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { Order, OrderStatus, PaymentMethod } from '../../../core/models/order.model';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-orders.component.html',
  styleUrls: ['./my-orders.component.scss']
})
export class MyOrdersComponent implements OnInit {
  orders: Order[] = [];
  isLoading = false;
  errorMessage = '';
  OrderStatus = OrderStatus;
  PaymentMethod = PaymentMethod;

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.orderService.getMyOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar órdenes:', error);
        this.errorMessage = 'Error al cargar las órdenes. Por favor, intenta nuevamente.';
        this.isLoading = false;
      }
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusColor(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PENDING:
        return '#ff9500';
      case OrderStatus.PROCESSING:
        return '#007bff';
      case OrderStatus.SHIPPED:
        return '#6f42c1';
      case OrderStatus.DELIVERED:
        return '#28a745';
      case OrderStatus.COMPLETED:
        return '#28a745';
      case OrderStatus.CANCELLED:
        return '#dc3545';
      default:
        return '#6c757d';
    }
  }

  getStatusIcon(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PENDING:
        return '⏳';
      case OrderStatus.PROCESSING:
        return '⚙️';
      case OrderStatus.SHIPPED:
        return '🚚';
      case OrderStatus.DELIVERED:
        return '📦';
      case OrderStatus.COMPLETED:
        return '✅';
      case OrderStatus.CANCELLED:
        return '❌';
      default:
        return '📋';
    }
  }

  getStatusText(status: OrderStatus): string {
    const statusTexts: Record<OrderStatus, string> = {
      [OrderStatus.PENDING]: 'Pendiente',
      [OrderStatus.PROCESSING]: 'Procesando',
      [OrderStatus.SHIPPED]: 'Enviada',
      [OrderStatus.DELIVERED]: 'Entregada',
      [OrderStatus.COMPLETED]: 'Completada',
      [OrderStatus.CANCELLED]: 'Cancelada'
    };
    
    return statusTexts[status] || status;
  }

  canCancelOrder(order: Order): boolean {
    return order.status === OrderStatus.PENDING || order.status === OrderStatus.PROCESSING;
  }

  getShippingAddressText(shippingAddress: any): string {
    if (typeof shippingAddress === 'string') {
      return shippingAddress;
    }

    if (typeof shippingAddress === 'object') {
      const { street, city, state, zipCode, country } = shippingAddress;
      return `${street}, ${city}${state ? ', ' + state : ''}${zipCode ? ', ' + zipCode : ''}${country ? ', ' + country : ''}`;
    }

    return 'Dirección no especificada';
  }

  getTotalItems(order: Order): number {
    return order.items.reduce((total, item) => total + item.quantity, 0);
  }

  getPaymentMethodText(paymentMethod: PaymentMethod): string {
    const paymentMethodTexts: Record<PaymentMethod, string> = {
      [PaymentMethod.CARD]: 'Tarjeta de Crédito',
      [PaymentMethod.PAYPAL]: 'PayPal',
      [PaymentMethod.BANK_TRANSFER]: 'Transferencia Bancaria'
    };

    return paymentMethodTexts[paymentMethod] || paymentMethod;
  }

  cancelOrder(orderId: string): void {
    if (!confirm('¿Estás seguro de que deseas cancelar esta orden?')) {
      return;
    }

    this.isLoading = true;
    this.orderService.cancelOrder(orderId).subscribe({
      next: () => {
        alert('Orden cancelada exitosamente');
        this.loadOrders(); // Recargar las órdenes
      },
      error: (error) => {
        console.error('Error canceling order:', error);
        alert('Error al cancelar la orden');
        this.isLoading = false;
      }
    });
  }
}
