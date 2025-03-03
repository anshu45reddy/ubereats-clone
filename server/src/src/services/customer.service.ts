import api from './api';
import { Order, CreateOrderData } from '../types/order';
import { Restaurant } from '../types/restaurant';

// Order Management
export const createOrder = async (data: CreateOrderData): Promise<Order> => {
  const response = await api.post('/customers/orders', data);
  return response.data.order;
};

export const getCustomerOrders = async (): Promise<Order[]> => {
  const response = await api.get('/customers/orders');
  return response.data.orders;
};

// Favorites Management
export const addFavorite = async (restaurantId: number): Promise<void> => {
  await api.post('/customers/favorites', { restaurantId });
};

export const removeFavorite = async (restaurantId: number): Promise<void> => {
  await api.delete(`/customers/favorites/${restaurantId}`);
};

export const getFavorites = async (): Promise<Restaurant[]> => {
  const response = await api.get('/customers/favorites');
  return response.data.favorites.map((fav: any) => fav.restaurant);
}; 