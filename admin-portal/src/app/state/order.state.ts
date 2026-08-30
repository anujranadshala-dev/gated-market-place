import { Injectable, computed, signal, inject, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Order, OrderStatus, LogisticsTracking } from '../core/models/order.model';
import { AuthStore } from '../core/auth/auth.store';
import { StoreState } from './store.state';

const API_BASE_URL = 'http://localhost:5000/api';

@Injectable({
  providedIn: 'root',
})
export class OrderState {
  private readonly authStore = inject(AuthStore);
  private readonly storeState = inject(StoreState);
  private readonly http = inject(HttpClient);

  private readonly _orders = signal<Order[]>([]);

  private readonly _statusFilter = signal<OrderStatus | 'ALL'>('ALL');
  private readonly _searchFilter = signal<string>('');

  constructor() {
    effect(() => {
      const user = this.authStore.user();
      if (user) {
        this.getOrders();
      } else {
        this._orders.set([]);
      }
    });
  }

  readonly orders = this._orders.asReadonly();
  readonly statusFilter = this._statusFilter.asReadonly();
  readonly searchFilter = this._searchFilter.asReadonly();

  readonly currentStoreOrders = computed<Order[]>(() => {
    const assignedStoreId = this.authStore.assignedStoreId();
    if (!assignedStoreId) return [];
    return this._orders().filter((o) => o.storeId === assignedStoreId);
  });

  readonly storePendingPackingOrders = computed<Order[]>(() => {
    return this.currentStoreOrders().filter((o) => o.status === 'Pending');
  });

  readonly packedOrdersForLogistics = computed<Order[]>(() => {
    return this._orders().filter((o) => o.status === 'Packed');
  });

  readonly outForDeliveryOrders = computed<Order[]>(() => {
    return this._orders().filter((o) => o.status === 'Out_for_Delivery');
  });

  readonly onTheWayOrders = computed<Order[]>(() => {
    return this._orders().filter((o) => o.status === 'On the way');
  });

  readonly deliveredOrders = computed<Order[]>(() => {
    return this._orders().filter((o) => o.status === 'Delivered');
  });

  readonly filteredOrders = computed<Order[]>(() => {
    const isSuperAdmin = this.authStore.isSuperAdmin();
    const items = isSuperAdmin ? this._orders() : this.currentStoreOrders();
    const status = this._statusFilter();
    const query = this._searchFilter().toLowerCase().trim();

    return items.filter((order) => {
      const matchesStatus = status === 'ALL' || order.status === status;
      const matchesQuery =
        !query ||
        order.orderNumber.toLowerCase().includes(query) ||
        order.customer.name.toLowerCase().includes(query) ||
        order.customer.email.toLowerCase().includes(query) ||
        order.storeName.toLowerCase().includes(query);

      return matchesStatus && matchesQuery;
    });
  });

  readonly pendingPackingCount = computed<number>(() => {
    return this.currentStoreOrders().filter((o) => o.status === 'Pending').length;
  });

  readonly packedReadyForDispatchCount = computed<number>(() => {
    return this._orders().filter((o) => o.status === 'Packed').length;
  });

  readonly inTransitCount = computed<number>(() => {
    return this._orders().filter((o) => o.status === 'Out_for_Delivery' || o.status === 'On the way').length;
  });

  public async getOrders(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ orders: any[] }>(`${API_BASE_URL}/orders`, { withCredentials: true })
      );

      if (response?.orders) {
        const mappedOrders: Order[] = response.orders.map((o: any) => ({
          id: o._id || o.id,
          orderNumber: o.orderNumber,
          storeId: o.storeId,
          storeName: o.storeName,
          customer: o.customer,
          shippingAddress: o.shippingAddress,
          items: o.items,
          subtotal: o.subtotal,
          shippingFee: o.shippingFee,
          taxAmount: o.taxAmount,
          discountAmount: o.discountAmount,
          totalAmount: o.totalAmount,
          currency: o.currency,
          status: o.status,
          paymentStatus: o.paymentStatus,
          logistics: o.logistics || {},
          packedAt: o.packedAt,
          packedByUserId: o.packedByUserId,
          createdAt: o.createdAt,
          updatedAt: o.updatedAt,
        }));
        this._orders.set(mappedOrders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      this._orders.set([]);
    }
  }

  public async createOrder(dto: Partial<Order>): Promise<void> {
    const payload = {
      storeId: dto.storeId,
      orderNumber: dto.orderNumber,
      customer: dto.customer,
      shippingAddress: dto.shippingAddress,
      items: dto.items,
      subtotal: dto.subtotal || 0,
      shippingFee: dto.shippingFee || 0,
      taxAmount: dto.taxAmount || 0,
      discountAmount: dto.discountAmount || 0,
      totalAmount: dto.totalAmount || 0,
      currency: dto.currency || 'INR',
      paymentStatus: dto.paymentStatus || 'PENDING',
      logistics: dto.logistics || {},
    };

    try {
      await firstValueFrom(
        this.http.post<{ message: string; orderId: string }>(
          `${API_BASE_URL}/create-order`,
          payload,
          { withCredentials: true }
        )
      );

      await this.getOrders();
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  public async updateOrder(orderId: string, updates: Partial<Order>): Promise<void> {
    try {
      await firstValueFrom(
        this.http.put<{ message: string; order: any }>(
          `${API_BASE_URL}/orders/${orderId}`,
          updates,
          { withCredentials: true }
        )
      );

      await this.getOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  }

  public async deleteOrder(orderId: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.delete<{ message: string }>(
          `${API_BASE_URL}/orders/${orderId}`,
          { withCredentials: true }
        )
      );

      this._orders.update((orders) => orders.filter((o) => o.id !== orderId));
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  }

  public setStatusFilter(status: OrderStatus | 'ALL'): void {
    this._statusFilter.set(status);
  }

  public setSearchFilter(query: string): void {
    this._searchFilter.set(query);
  }

  public async markAsPacked(orderId: string, packingNotes?: string): Promise<void> {
    const currentUserId = this.authStore.user()?.id;
    await this.updateOrder(orderId, {
      status: 'Packed',
      packedAt: new Date().toISOString(),
      packedByUserId: currentUserId,
      logistics: {
        ...this._orders().find((o) => o.id === orderId)?.logistics || {},
        shippingNotes: packingNotes,
      },
    });
  }

  public async markAsOnTheWay(orderId: string): Promise<void> {
    const existingLogistics = this._orders().find((o) => o.id === orderId)?.logistics || {};
    await this.updateOrder(orderId, {
      status: 'On the way',
      logistics: {
        ...existingLogistics,
        dispatchedAt: new Date().toISOString(),
      },
    });
  }

  public async markOutForDelivery(
    orderId: string,
    logisticsData: {
      carrierName: string;
      trackingNumber: string;
      driverName?: string;
      driverPhone?: string;
      estimatedDeliveryDate?: string;
    }
  ): Promise<void> {
    const existingLogistics = this._orders().find((o) => o.id === orderId)?.logistics || {};
    await this.updateOrder(orderId, {
      status: 'Out_for_Delivery',
      logistics: {
        ...existingLogistics,
        carrierName: logisticsData.carrierName,
        trackingNumber: logisticsData.trackingNumber,
        driverName: logisticsData.driverName || 'Dispatch Fleet Alpha',
        driverPhone: logisticsData.driverPhone || '+1 (800) 555-EXPR',
        dispatchedAt: new Date().toISOString(),
        estimatedDeliveryDate:
          logisticsData.estimatedDeliveryDate ||
          new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
    });
  }

  public async markDelivered(orderId: string): Promise<void> {
    const existingLogistics = this._orders().find((o) => o.id === orderId)?.logistics || {};
    await this.updateOrder(orderId, {
      status: 'Delivered',
      logistics: {
        ...existingLogistics,
        deliveredAt: new Date().toISOString(),
      },
    });
  }
}
