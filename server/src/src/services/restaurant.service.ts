import api from './api';
import { Restaurant, Dish, CreateDishData, UpdateDishData } from '../types/restaurant';
import { Order, UpdateOrderStatusData } from '../types/order';

// Restaurant Management
export const getRestaurants = async (search?: string): Promise<Restaurant[]> => {
  const response = await api.get('/customers/restaurants', {
    params: { search },
  });
  return response.data.restaurants;
};

export const getRestaurantDetails = async (id: number): Promise<Restaurant> => {
  const response = await api.get(`/customers/restaurants/${id}`);
  return response.data.restaurant;
};

// Dish Management
export const addDish = async (data: CreateDishData): Promise<Dish> => {
  const response = await api.post('/restaurants/dishes', data);
  return response.data.dish;
};

export const updateDish = async (id: number, data: UpdateDishData): Promise<Dish> => {
  const response = await api.put(`/restaurants/dishes/${id}`, data);
  return response.data.dish;
};

export const deleteDish = async (id: number): Promise<void> => {
  await api.delete(`/restaurants/dishes/${id}`);
};

export const getDishes = async (): Promise<Dish[]> => {
  const response = await api.get('/restaurants/dishes');
  return response.data.dishes;
};

// Order Management
export const getRestaurantOrders = async (status?: string): Promise<Order[]> => {
  const response = await api.get('/restaurants/orders', {
    params: { status },
  });
  return response.data.orders;
};

export const updateOrderStatus = async (
  orderId: number,
  data: UpdateOrderStatusData
): Promise<Order> => {
  const response = await api.put(`/restaurants/orders/${orderId}/status`, data);
  return response.data.order;
}; 