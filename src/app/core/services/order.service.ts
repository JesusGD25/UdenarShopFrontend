import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateOrderDto, ProcessPaymentDto, Order, OrderStatus } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  createOrder(createOrderDto: CreateOrderDto): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, createOrderDto);
  }

  processPayment(orderId: string, paymentDto: ProcessPaymentDto): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/${orderId}/pay`, paymentDto);
  }

  getMyOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl);
  }

  getMySales(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/sales`);
  }

  getOrderDetails(orderId: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${orderId}`);
  }

  cancelOrder(orderId: string): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/${orderId}/cancel`, {});
  }

  updateOrderStatus(orderId: string, status: OrderStatus): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/${orderId}/status`, { status });
  }
}
