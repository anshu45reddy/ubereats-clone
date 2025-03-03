import { Dish } from './restaurant';
import { User } from './auth';

export type OrderStatus =
  | 'New'
  | 'Order Received'
  | 'Preparing'
  | 'On the Way'
  | 'Pick-up Ready'
  | 'Delivered'
  | 'Picked Up'
  | 'Cancelled';

export interface OrderItem {
  id: number;
  orderId: number;
  dishId: number;
  quantity: number;
  price: number;
  dish?: Dish;
}

export interface Order {
  id: number;
  customerId: number;
  restaurantId: number;
  status: OrderStatus;
  totalAmount: number;
  items: OrderItem[];
  customer?: User;
  restaurant?: User;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderData {
  restaurantId: number;
  items: {
    dishId: number;
    quantity: number;
  }[];
}

export interface UpdateOrderStatusData {
  status: OrderStatus;
} 