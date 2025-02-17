import api from './api';
import { Order, CreateOrderData } from '../types/order';

export const createOrder = async (data: CreateOrderData): Promise<Order> => {
  const response = await api.post('/customers/orders', data);
  return response.data.order;
};

export const getCustomerOrders = async (status?: string): Promise<Order[]> => {
  const response = await api.get('/customers/orders', {
    params: { status },
  });
  return response.data.orders;
};

export const cancelOrder = async (orderId: string): Promise<Order> => {
  const response = await api.put(`/customers/orders/${orderId}/cancel`);
  return response.data.order;
}; 