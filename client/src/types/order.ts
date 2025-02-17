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
  id: string;
  orderId: string;
  dishId: string;
  quantity: number;
  price: number;
  dish?: Dish;
}

export interface Order {
  id: string;
  customerId: string;
  restaurantId: string;
  status: OrderStatus;
  totalAmount: number;
  items: OrderItem[];
  customer?: User;
  restaurant?: User;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderData {
  restaurantId: string;
  items: {
    dishId: string;
    quantity: number;
  }[];
}

export interface UpdateOrderStatusData {
  status: OrderStatus;
} 