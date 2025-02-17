import api from './api';
import { Restaurant, Dish, CreateDishData, UpdateDishData } from '../types/restaurant';
import { Order, UpdateOrderStatusData } from '../types/order';

// Restaurant Management
export const getRestaurants = async (search?: string): Promise<Restaurant[]> => {
  const response = await api.get('/customers/restaurants', {
    params: { search },
  });
  
  // Ensure we have an array of restaurants
  const restaurants = response.data.restaurants || [];
  
  // Filter out duplicate restaurants by name
  const uniqueRestaurants = restaurants.reduce((acc: Restaurant[], current: Restaurant) => {
    const x = acc.find(item => item.name === current.name);
    if (!x) {
      return acc.concat([current]);
    } else {
      return acc;
    }
  }, []);
  
  return uniqueRestaurants;
};

export const getRestaurantDetails = async (id: string): Promise<Restaurant> => {
  const response = await api.get(`/customers/restaurants/${id}`);
  return response.data.restaurant;
};

// Dish Management
export const addDish = async (data: CreateDishData): Promise<Dish> => {
  const response = await api.post('/restaurants/dishes', data);
  return response.data.dish;
};

export const updateDish = async (id: string, data: UpdateDishData): Promise<Dish> => {
  const response = await api.put(`/restaurants/dishes/${id}`, data);
  return response.data.dish;
};

export const deleteDish = async (id: string): Promise<void> => {
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
  // Handle both formats: direct array or wrapped in orders property
  return Array.isArray(response.data) ? response.data : 
         (response.data && response.data.orders) ? response.data.orders : [];
};

export const updateOrderStatus = async (
  orderId: string,
  data: UpdateOrderStatusData
): Promise<Order> => {
  const response = await api.put(`/restaurants/orders/${orderId}/status`, data);
  return response.data.order;
}; 