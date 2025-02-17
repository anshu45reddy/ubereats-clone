import { User } from './auth';

export interface Dish {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: 'Appetizer' | 'Salad' | 'Main Course' | 'Dessert' | 'Beverage';
  ingredients: string;
}

export interface Restaurant extends User {
  dishes?: Dish[];
}

export interface CreateDishData {
  name: string;
  description: string;
  price: number;
  image?: string;
  category: 'Appetizer' | 'Salad' | 'Main Course' | 'Dessert' | 'Beverage';
  ingredients: string;
}

export interface UpdateDishData extends Partial<CreateDishData> {} 