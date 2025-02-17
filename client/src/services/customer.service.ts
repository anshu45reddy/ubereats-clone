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
  // Handle both formats: direct array or wrapped in orders property
  return Array.isArray(response.data) ? response.data : 
         (response.data && response.data.orders) ? response.data.orders : [];
};

// Favorites Management
export const addFavorite = async (restaurantId: string): Promise<void> => {
  try {
    await api.post('/customers/favorites', { restaurantId });
  } catch (error) {
    console.error('Error in addFavorite service:', error);
    throw error;
  }
};

export const removeFavorite = async (restaurantId: string): Promise<void> => {
  try {
    await api.delete(`/customers/favorites/${restaurantId}`);
  } catch (error) {
    console.error('Error in removeFavorite service:', error);
    throw error;
  }
};

export const getFavorites = async (): Promise<Restaurant[]> => {
  try {
    const response = await api.get('/customers/favorites');
    console.log('API response for favorites:', response.data); // Debug log
    
    // Handle different response formats
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && Array.isArray(response.data.restaurants)) {
      return response.data.restaurants;
    } else {
      console.error('Unexpected response format:', response.data);
      return [];
    }
  } catch (error) {
    console.error('Error in getFavorites service:', error);
    return [];
  }
}; 