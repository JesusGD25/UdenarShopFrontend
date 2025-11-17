import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../../core/services/order.service';
import { Order, OrderStatus } from '../../../core/models/order.model';
import { LucideAngularModule, Package, Clock, CheckCircle, XCircle, Truck, PackageCheck } from 'lucide-angular';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './my-orders.component.html',
  styleUrls: ['./my-orders.component.scss']
})
export class MyOrdersComponent implements OnInit {
  readonly Package = Package;
  readonly Clock = Clock;
  readonly CheckCircle = CheckCircle;
  readonly XCircle = XCircle;
  readonly Truck = Truck;
  readonly PackageCheck = PackageCheck;

  orders: Order[] = [];
  isLoading = false;
  errorMessage = '';
  OrderStatus = OrderStatus;

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

  getStatusIcon(status: OrderStatus): any {
    switch (status) {
      case OrderStatus.PENDING:
        return this.Clock;
      case OrderStatus.PAID:
        return this.CheckCircle;
      case OrderStatus.SHIPPED:
        return this.Truck;
      case OrderStatus.DELIVERED:
        return this.PackageCheck;
      case OrderStatus.CANCELLED:
        return this.XCircle;
      default:
        return this.Package;
    }
  }

  getStatusClass(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PENDING:
        return 'status-pending';
      case OrderStatus.PAID:
        return 'status-paid';
      case OrderStatus.SHIPPED:
        return 'status-shipped';
      case OrderStatus.DELIVERED:
        return 'status-delivered';
      case OrderStatus.CANCELLED:
        return 'status-cancelled';
      default:
        return '';
    }
  }

  getStatusText(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PENDING:
        return 'Pendiente';
      case OrderStatus.PAID:
        return 'Pagada';
      case OrderStatus.SHIPPED:
        return 'Enviada';
      case OrderStatus.DELIVERED:
        return 'Entregada';
      case OrderStatus.CANCELLED:
        return 'Cancelada';
      default:
        return status;
    }
  }

  cancelOrder(orderId: string): void {
    if (!confirm('¿Estás seguro de que deseas cancelar esta orden?')) {
      return;
    }

    this.orderService.cancelOrder(orderId).subscribe({
      next: (updatedOrder) => {
        const index = this.orders.findIndex(o => o.id === orderId);
        if (index !== -1) {
          this.orders[index] = updatedOrder;
        }
        alert('Orden cancelada exitosamente');
      },
      error: (error) => {
        console.error('Error al cancelar orden:', error);
        alert(error.error?.message || 'Error al cancelar la orden');
      }
    });
  }

  canCancelOrder(order: Order): boolean {
    return order.status === OrderStatus.PENDING || order.status === OrderStatus.PAID;
  }

  getTotalItems(order: Order): number {
    return order.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
