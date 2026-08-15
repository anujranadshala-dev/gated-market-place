import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Order } from '../../types';

interface OrderState {
  orders: Order[];
  activeOrder: Order | null;
  isOrderModalOpen: boolean;
  isProcessingCheckout: boolean;
}

const initialMockOrders: Order[] = [
  {
    id: 'ord_sample_9021',
    orderNumber: 'NX-ORD-882194',
    userId: 'usr_enterprise_sarah',
    userEmail: 'sarah.jenkins@aerodyne-corp.com',
    organization: 'Aerodyne Aerospace & Robotics Labs',
    items: [
      {
        product: {
          id: 'prod_nexus_01',
          storeId: 'store_nexus_robotics',
          storeName: 'Nexus Industrial Automation',
          sku: 'NX-ACT-8800',
          name: 'Nexus Ultra-Torque 6-DOF Brushless Servo Actuator',
          description: 'Industrial robotic actuator with harmonic drive gearbox',
          category: 'Actuators & Motors',
          basePrice: 1250.00,
          moq: 2,
          stock: 48,
          inStock: true,
          leadTimeDays: 3,
          taxRate: 0.0825,
          priceTiers: [],
          specifications: {},
          imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
          complianceTags: ['CE Compliant']
        },
        quantity: 5,
        appliedUnitPrice: 1150.00,
        appliedDiscountPercent: 8,
        itemSubtotal: 5750.00,
        itemTax: 474.38,
        storeId: 'store_nexus_robotics',
        storeName: 'Nexus Industrial Automation'
      }
    ],
    subtotal: 5750.00,
    discountTotal: 460.00,
    taxTotal: 474.38,
    shippingFee: 150.00,
    grandTotal: 5914.38,
    status: 'Pending',
    paymentMethod: 'PO_INVOICE',
    poNumber: 'PO-AERODYNE-2026-0994',
    shippingAddress: {
      recipientName: 'Sarah Jenkins (Receiving Dock 4)',
      company: 'Aerodyne Aerospace & Robotics Labs',
      addressLine: '8400 Technology Parkway, Suite 100',
      city: 'Austin',
      state: 'TX',
      zipCode: '78759',
      country: 'United States'
    },
    notes: 'Please attach NIST calibration certificates with shipping container.',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    storeIds: ['store_nexus_robotics']
  }
];

const initialState: OrderState = {
  orders: initialMockOrders,
  activeOrder: null,
  isOrderModalOpen: false,
  isProcessingCheckout: false
};

export const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    startCheckoutProcessing: (state) => {
      state.isProcessingCheckout = true;
    },
    checkoutSuccess: (state, action: PayloadAction<Order>) => {
      state.isProcessingCheckout = false;
      state.orders.unshift(action.payload);
      state.activeOrder = action.payload;
      state.isOrderModalOpen = true;
    },
    checkoutFailure: (state) => {
      state.isProcessingCheckout = false;
    },
    setActiveOrder: (state, action: PayloadAction<Order | null>) => {
      state.activeOrder = action.payload;
    },
    toggleOrderModal: (state, action: PayloadAction<boolean | undefined>) => {
      state.isOrderModalOpen = action.payload !== undefined ? action.payload : !state.isOrderModalOpen;
    },
    advanceOrderStatus: (state, action: PayloadAction<{ orderId: string; newStatus: Order['status'] }>) => {
      const order = state.orders.find((o) => o.id === action.payload.orderId);
      if (order) {
        order.status = action.payload.newStatus;
        if (state.activeOrder && state.activeOrder.id === action.payload.orderId) {
          state.activeOrder.status = action.payload.newStatus;
        }
      }
    }
  }
});

export const {
  startCheckoutProcessing,
  checkoutSuccess,
  checkoutFailure,
  setActiveOrder,
  toggleOrderModal,
  advanceOrderStatus
} = orderSlice.actions;

export default orderSlice.reducer;
