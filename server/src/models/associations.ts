import User from './User';
import Dish from './Dish';
import { Order, OrderItem } from './Order';
import Favorite from './Favorite';

// User-Dish associations
User.hasMany(Dish, {
  foreignKey: 'restaurantId',
  as: 'dishes',
  constraints: false
});

Dish.belongsTo(User, {
  foreignKey: 'restaurantId',
  as: 'restaurant',
  constraints: false
});

// Order associations
Order.belongsTo(User, {
  foreignKey: 'customerId',
  as: 'customer',
  constraints: false,
  scope: {
    role: 'customer',
  },
});

Order.belongsTo(User, {
  foreignKey: 'restaurantId',
  as: 'restaurant',
  constraints: false,
  scope: {
    role: 'restaurant',
  },
});

Order.hasMany(OrderItem, {
  foreignKey: 'orderId',
  as: 'items',
});

OrderItem.belongsTo(Order, {
  foreignKey: 'orderId',
  as: 'order',
});

OrderItem.belongsTo(Dish, {
  foreignKey: 'dishId',
  as: 'dish',
});

// Favorite associations
Favorite.belongsTo(User, {
  foreignKey: 'customerId',
  as: 'customer',
  constraints: false,
  scope: {
    role: 'customer',
  },
});

Favorite.belongsTo(User, {
  foreignKey: 'restaurantId',
  as: 'restaurant',
  constraints: false,
  scope: {
    role: 'restaurant',
  },
});

export { User, Dish, Order, OrderItem, Favorite }; 