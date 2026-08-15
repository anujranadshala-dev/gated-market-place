import { Injectable, computed, signal, inject } from '@angular/core';
import { Order, OrderStatus, LogisticsTracking } from '../core/models/order.model';
import { AuthStore } from '../core/auth/auth.store';

/**
 * Modern Angular 21 Signal Store for Order Fulfillment & Logistics Pipeline
 * Enforces the strict RBAC lifecycle:
 * 1. Customer places order -> Status: 'Pending'
 * 2. Store Owner packs items -> Status: 'Packed'
 * 3. Super Admin Logistics dispatches carrier -> Status: 'Out_for_Delivery'
 * 4. Super Admin confirms fulfillment -> Status: 'Delivered'
 */
@Injectable({
  providedIn: 'root',
})
export class OrderState {
  private readonly authStore = inject(AuthStore);

  // Initial Seed Orders
  private readonly _orders = signal<Order[]>([
    {
      id: 'ord_901',
      orderNumber: 'ORD-2025-0891',
      storeId: 'str_vance_01',
      storeName: 'Vance Luxury Atelier',
      customer: {
        id: 'cust_101',
        name: 'Lord Henry Cavendish',
        email: 'henry.cavendish@mayfair-club.co.uk',
        phone: '+44 20 7946 0912',
        tier: 'VIP_BLACK',
      },
      shippingAddress: {
        recipientName: 'Lord Henry Cavendish',
        street: '14 Berkeley Square',
        suite: 'Penthouse B',
        city: 'London',
        state: 'Greater London',
        postalCode: 'W1J 6BQ',
        country: 'United Kingdom',
      },
      items: [
        {
          productId: 'prod_01',
          productName: 'Vanguard Hand-Stitched Leather Briefcase',
          sku: 'VNC-BRF-001',
          quantity: 1,
          unitPrice: 2450,
          totalPrice: 2450,
          isGatedExclusive: true,
          imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=200&auto=format&fit=crop&q=80',
        },
        {
          productId: 'prod_04',
          productName: 'Sovereign Damascus Steel Cigar Cutter',
          sku: 'VNC-ACC-99',
          quantity: 1,
          unitPrice: 1350,
          totalPrice: 1350,
          isGatedExclusive: true,
          imageUrl: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=200&auto=format&fit=crop&q=80',
        },
      ],
      subtotal: 3800,
      shippingFee: 0, // Complimentary VIP shipping
      taxAmount: 380,
      discountAmount: 0,
      totalAmount: 4180,
      currency: 'USD',
      status: 'Pending', // Ready for Store Owner to pack!
      paymentStatus: 'PAID',
      logistics: {},
      createdAt: '2025-02-14T01:30:00Z',
      updatedAt: '2025-02-14T01:30:00Z',
    },
    {
      id: 'ord_902',
      orderNumber: 'ORD-2025-0892',
      storeId: 'str_vance_01',
      storeName: 'Vance Luxury Atelier',
      customer: {
        id: 'cust_102',
        name: 'Genevieve Dupond',
        email: 'g.dupond@geneva-private.ch',
        phone: '+41 22 555 0184',
        tier: 'GOLD',
      },
      shippingAddress: {
        recipientName: 'Genevieve Dupond',
        street: 'Rue du Rhône 42',
        city: 'Geneva',
        state: 'Geneva',
        postalCode: '1204',
        country: 'Switzerland',
      },
      items: [
        {
          productId: 'prod_02',
          productName: 'Chronos Horology Travel Roll (Quad)',
          sku: 'VNC-WTR-004',
          quantity: 2,
          unitPrice: 890,
          totalPrice: 1780,
          isGatedExclusive: false,
          imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200&auto=format&fit=crop&q=80',
        },
      ],
      subtotal: 1780,
      shippingFee: 65,
      taxAmount: 142,
      discountAmount: 0,
      totalAmount: 1987,
      currency: 'USD',
      status: 'Packed', // Packed by Vance Atelier, ready for Super Admin Logistics Board!
      paymentStatus: 'PAID',
      logistics: {
        shippingNotes: 'Insured high-value fine leather shipment. Signature required.',
      },
      packedAt: '2025-02-13T16:45:00Z',
      packedByUserId: 'usr_owner_01',
      createdAt: '2025-02-13T14:10:00Z',
      updatedAt: '2025-02-13T16:45:00Z',
    },
    {
      id: 'ord_903',
      orderNumber: 'ORD-2025-0893',
      storeId: 'str_aethel_02',
      storeName: 'Aethelgard Rare Botanicals',
      customer: {
        id: 'cust_103',
        name: 'Soren Lindqvist',
        email: 'soren@lindqvist-family.se',
        phone: '+46 8 123 4567',
        tier: 'SILVER',
      },
      shippingAddress: {
        recipientName: 'Soren Lindqvist',
        street: 'Strandvägen 18',
        city: 'Stockholm',
        state: 'Stockholm',
        postalCode: '114 56',
        country: 'Sweden',
      },
      items: [
        {
          productId: 'prod_05',
          productName: 'Nocturne Alpine Oud Parfum Extrait 50ml',
          sku: 'AET-OUD-050',
          quantity: 1,
          unitPrice: 680,
          totalPrice: 680,
          isGatedExclusive: false,
          imageUrl: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=200&auto=format&fit=crop&q=80',
        },
      ],
      subtotal: 680,
      shippingFee: 45,
      taxAmount: 170,
      discountAmount: 0,
      totalAmount: 895,
      currency: 'USD',
      status: 'Out_for_Delivery', // Dispatched by Super Admin Logistics
      paymentStatus: 'PAID',
      logistics: {
        carrierName: 'DHL Express Private Courier',
        trackingNumber: 'DHL-EU-982310842',
        driverName: 'Matthias Berg',
        driverPhone: '+46 70 889 1234',
        dispatchedAt: '2025-02-13T10:00:00Z',
        estimatedDeliveryDate: '2025-02-14T17:00:00Z',
      },
      packedAt: '2025-02-12T18:20:00Z',
      createdAt: '2025-02-12T15:00:00Z',
      updatedAt: '2025-02-13T10:00:00Z',
    },
    {
      id: 'ord_904',
      orderNumber: 'ORD-2025-0894',
      storeId: 'str_zenith_03',
      storeName: 'Zenith Haute Audio',
      customer: {
        id: 'cust_104',
        name: 'Viktor Krumm',
        email: 'v.krumm@berlin-tech.de',
        phone: '+49 30 901820',
        tier: 'VIP_BLACK',
      },
      shippingAddress: {
        recipientName: 'Viktor Krumm',
        street: 'Kurfürstendamm 195',
        city: 'Berlin',
        state: 'Berlin',
        postalCode: '10707',
        country: 'Germany',
      },
      items: [
        {
          productId: 'prod_06',
          productName: 'Aether Monoblock Class-A Tube Amplifier',
          sku: 'ZNT-AMP-300B',
          quantity: 1,
          unitPrice: 8400,
          totalPrice: 8400,
          isGatedExclusive: true,
          imageUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=200&auto=format&fit=crop&q=80',
        },
      ],
      subtotal: 8400,
      shippingFee: 250, // Heavy freight white-glove delivery
      taxAmount: 1596,
      discountAmount: 0,
      totalAmount: 10246,
      currency: 'USD',
      status: 'Delivered', // Successfully completed
      paymentStatus: 'PAID',
      logistics: {
        carrierName: 'White Glove Freight Global',
        trackingNumber: 'WGF-BER-884102',
        driverName: 'Hans Becker',
        driverPhone: '+49 171 99281',
        dispatchedAt: '2025-02-11T08:00:00Z',
        deliveredAt: '2025-02-13T14:30:00Z',
        shippingNotes: 'Hand-delivered into listening room, signed by customer.',
      },
      packedAt: '2025-02-10T14:00:00Z',
      createdAt: '2025-02-10T10:00:00Z',
      updatedAt: '2025-02-13T14:30:00Z',
    },
    {
      id: 'ord_905',
      orderNumber: 'ORD-2025-0895',
      storeId: 'str_vance_01',
      storeName: 'Vance Luxury Atelier',
      customer: {
        id: 'cust_105',
        name: 'Camilla Rossi',
        email: 'camilla@rossi-milano.it',
        phone: '+39 02 88451',
        tier: 'GOLD',
      },
      shippingAddress: {
        recipientName: 'Camilla Rossi',
        street: 'Via Montenapoleone 8',
        city: 'Milan',
        state: 'Lombardy',
        postalCode: '20121',
        country: 'Italy',
      },
      items: [
        {
          productId: 'prod_03',
          productName: 'Black Label Monogrammed Desk Pad',
          sku: 'VNC-DSK-012',
          quantity: 3,
          unitPrice: 420,
          totalPrice: 1260,
          isGatedExclusive: false,
          imageUrl: 'https://images.unsplash.com/photo-1585776245993-841961e6878b?w=200&auto=format&fit=crop&q=80',
        },
      ],
      subtotal: 1260,
      shippingFee: 50,
      taxAmount: 277,
      discountAmount: 0,
      totalAmount: 1587,
      currency: 'USD',
      status: 'Pending',
      paymentStatus: 'PAID',
      logistics: {},
      createdAt: '2025-02-14T03:00:00Z',
      updatedAt: '2025-02-14T03:00:00Z',
    },
  ]);

  private readonly _statusFilter = signal<OrderStatus | 'ALL'>('ALL');
  private readonly _searchFilter = signal<string>('');

  // Readonly Signals
  readonly orders = this._orders.asReadonly();
  readonly statusFilter = this._statusFilter.asReadonly();
  readonly searchFilter = this._searchFilter.asReadonly();

  // Computed Signals
  readonly currentStoreOrders = computed<Order[]>(() => {
    const assignedStoreId = this.authStore.assignedStoreId();
    if (!assignedStoreId) return [];
    return this._orders().filter((o) => o.storeId === assignedStoreId);
  });

  // Store Owner Packing Queue: incoming orders requiring physical packing
  readonly storePendingPackingOrders = computed<Order[]>(() => {
    return this.currentStoreOrders().filter((o) => o.status === 'Pending');
  });

  // Super Admin Logistics Pipeline Stages
  readonly packedOrdersForLogistics = computed<Order[]>(() => {
    return this._orders().filter((o) => o.status === 'Packed');
  });

  readonly outForDeliveryOrders = computed<Order[]>(() => {
    return this._orders().filter((o) => o.status === 'Out_for_Delivery');
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

  // Metrics
  readonly pendingPackingCount = computed<number>(() => {
    return this.currentStoreOrders().filter((o) => o.status === 'Pending').length;
  });

  readonly packedReadyForDispatchCount = computed<number>(() => {
    return this._orders().filter((o) => o.status === 'Packed').length;
  });

  readonly inTransitCount = computed<number>(() => {
    return this._orders().filter((o) => o.status === 'Out_for_Delivery').length;
  });

  // Action Methods
  public setStatusFilter(status: OrderStatus | 'ALL'): void {
    this._statusFilter.set(status);
  }

  public setSearchFilter(query: string): void {
    this._searchFilter.set(query);
  }

  /**
   * Store Owner Action: Mark physical items as 'Packed'
   */
  public markAsPacked(orderId: string, packingNotes?: string): void {
    const currentUserId = this.authStore.user()?.id;
    this._orders.update((orders) =>
      orders.map((order) => {
        if (order.id === orderId) {
          return {
            ...order,
            status: 'Packed',
            packedAt: new Date().toISOString(),
            packedByUserId: currentUserId,
            logistics: {
              ...order.logistics,
              shippingNotes: packingNotes || order.logistics.shippingNotes,
            },
            updatedAt: new Date().toISOString(),
          };
        }
        return order;
      })
    );
  }

  /**
   * Super Admin Logistics Action: Mark 'Packed' order as 'Out_for_Delivery'
   */
  public markOutForDelivery(
    orderId: string,
    logisticsData: {
      carrierName: string;
      trackingNumber: string;
      driverName?: string;
      driverPhone?: string;
      estimatedDeliveryDate?: string;
    }
  ): void {
    this._orders.update((orders) =>
      orders.map((order) => {
        if (order.id === orderId) {
          return {
            ...order,
            status: 'Out_for_Delivery',
            logistics: {
              ...order.logistics,
              carrierName: logisticsData.carrierName,
              trackingNumber: logisticsData.trackingNumber,
              driverName: logisticsData.driverName || 'Dispatch Fleet Alpha',
              driverPhone: logisticsData.driverPhone || '+1 (800) 555-EXPR',
              dispatchedAt: new Date().toISOString(),
              estimatedDeliveryDate:
                logisticsData.estimatedDeliveryDate ||
                new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            },
            updatedAt: new Date().toISOString(),
          };
        }
        return order;
      })
    );
  }

  /**
   * Super Admin Logistics Action: Mark 'Out_for_Delivery' order as 'Delivered'
   */
  public markDelivered(orderId: string): void {
    this._orders.update((orders) =>
      orders.map((order) => {
        if (order.id === orderId) {
          return {
            ...order,
            status: 'Delivered',
            logistics: {
              ...order.logistics,
              deliveredAt: new Date().toISOString(),
            },
            updatedAt: new Date().toISOString(),
          };
        }
        return order;
      })
    );
  }
}
