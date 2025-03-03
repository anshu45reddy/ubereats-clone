export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'customer' | 'restaurant';
  created_at: Date;
  updated_at: Date;
}

export interface Customer extends User {
  profile_picture?: string;
  country: string;
  state: string;
}

export interface Restaurant extends User {
  location: string;
  description: string;
  contact_info: string;
  opening_hours: string;
  closing_hours: string;
  image?: string;
}

export interface Dish {
  id: number;
  restaurant_id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  ingredients: string;
  created_at: Date;
  updated_at: Date;
}

export interface Order {
  id: number;
  customer_id: number;
  restaurant_id: number;
  status: 'new' | 'preparing' | 'on_the_way' | 'pickup_ready' | 'delivered' | 'picked_up' | 'cancelled';
  total_amount: number;
  created_at: Date;
  updated_at: Date;
}

export interface OrderItem {
  id: number;
  order_id: number;
  dish_id: number;
  quantity: number;
  price: number;
}

export interface Favorite {
  id: number;
  customer_id: number;
  restaurant_id: number;
  created_at: Date;
} 