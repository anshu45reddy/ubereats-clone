import { Request, Response } from 'express';
import { Op } from 'sequelize';
import User from '../models/User';
import Dish from '../models/Dish';
import { Order, OrderItem } from '../models/Order';
import Favorite from '../models/Favorite';

// Restaurant Browsing
export const getRestaurants = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    const where: any = { role: 'restaurant' };

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    const restaurants = await User.findAll({
      where,
      attributes: ['id', 'name', 'description', 'location', 'profilePicture', 'timings'],
    });

    // Ensure we're returning an array of unique restaurants
    const uniqueRestaurants = Array.from(
      new Map(restaurants.map(restaurant => [restaurant.id, restaurant])).values()
    );

    res.json({ restaurants: uniqueRestaurants });
  } catch (error) {
    console.error('Get restaurants error:', error);
    res.status(500).json({ message: 'Error fetching restaurants' });
  }
};

export const getRestaurantDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const restaurant = await User.findOne({
      where: {
        id,
        role: 'restaurant',
      },
      include: [{
        model: Dish,
        as: 'dishes',
      }],
      attributes: { exclude: ['password'] }
    });

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Convert restaurant to plain object and ensure prices are numbers
    const plainRestaurant = restaurant.toJSON();
    
    // Ensure dishes is an array and convert prices to numbers
    if (plainRestaurant.dishes && Array.isArray(plainRestaurant.dishes)) {
      plainRestaurant.dishes = plainRestaurant.dishes.map(dish => ({
        ...dish,
        price: parseFloat(dish.price.toString())
      }));
    }

    res.json({ restaurant: plainRestaurant });
  } catch (error) {
    console.error('Get restaurant details error:', error);
    res.status(500).json({ message: 'Error fetching restaurant details' });
  }
};

// Order Management
export const createOrder = async (req: Request, res: Response) => {
  try {
    const customerId = req.session.userId;
    if (!customerId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { restaurantId, items } = req.body;

    // Validate restaurant exists
    const restaurant = await User.findOne({
      where: { id: restaurantId, role: 'restaurant' },
    });

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Validate and get dishes
    const dishIds = items.map((item: any) => item.dishId);
    const dishes = await Dish.findAll({
      where: {
        id: dishIds,
        restaurantId,
      },
    });

    if (dishes.length !== dishIds.length) {
      return res.status(400).json({ message: 'Some dishes are invalid' });
    }

    // Calculate total amount
    let totalAmount = 0;
    const itemsWithPrice = items.map((item: any) => {
      const dish = dishes.find((d) => d.id.toString() === item.dishId.toString());
      if (!dish) {
        throw new Error('Dish not found');
      }
      const itemTotal = dish.price * item.quantity;
      totalAmount += itemTotal;
      return {
        ...item,
        price: dish.price,
      };
    });

    // Create order
    const order = await Order.create({
      customerId,
      restaurantId,
      status: 'New',
      totalAmount,
    });

    // Create order items
    await Promise.all(
      itemsWithPrice.map((item: any) =>
        OrderItem.create({
          orderId: order.id,
          dishId: item.dishId,
          quantity: item.quantity,
          price: item.price,
        })
      )
    );

    // Get complete order with items
    const completeOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Dish, as: 'dish' }],
        },
        { model: User, as: 'customer', attributes: { exclude: ['password'] } },
        { model: User, as: 'restaurant', attributes: { exclude: ['password'] } },
      ],
    });

    res.status(201).json({ order: completeOrder });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Error creating order' });
  }
};

export const getCustomerOrders = async (req: Request, res: Response) => {
  try {
    const customerId = req.session.userId;
    if (!customerId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const orders = await Order.findAll({
      where: { customerId },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Dish, as: 'dish' }],
        },
        { model: User, as: 'restaurant', attributes: { exclude: ['password'] } },
      ],
      order: [['createdAt', 'DESC']],
    });

    // Convert to plain objects and ensure numeric values
    const plainOrders = orders.map(order => {
      const plainOrder = order.toJSON();
      
      // Ensure totalAmount is a number
      plainOrder.totalAmount = parseFloat(plainOrder.totalAmount.toString());
      
      // Ensure item prices are numbers
      if (plainOrder.items && Array.isArray(plainOrder.items)) {
        plainOrder.items = plainOrder.items.map(item => ({
          ...item,
          price: parseFloat(item.price.toString())
        }));
      }
      
      return plainOrder;
    });

    res.json({ orders: plainOrders });
  } catch (error) {
    console.error('Get customer orders error:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
};

// Favorites Management
export const addFavorite = async (req: Request, res: Response) => {
  try {
    const customerId = req.session.userId;
    const { restaurantId } = req.body;

    const [favorite, created] = await Favorite.findOrCreate({
      where: { customerId, restaurantId },
    });

    if (!created) {
      return res.status(400).json({ message: 'Restaurant already in favorites' });
    }

    res.status(201).json({
      message: 'Restaurant added to favorites',
      favorite,
    });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ message: 'Error adding favorite' });
  }
};

export const removeFavorite = async (req: Request, res: Response) => {
  try {
    const customerId = req.session.userId;
    const { restaurantId } = req.params;

    const favorite = await Favorite.findOne({
      where: { customerId, restaurantId },
    });

    if (!favorite) {
      return res.status(404).json({ message: 'Favorite not found' });
    }

    await favorite.destroy();

    res.json({ message: 'Restaurant removed from favorites' });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ message: 'Error removing favorite' });
  }
};

export const getFavorites = async (req: Request, res: Response) => {
  try {
    const customerId = req.session.userId;
    
    // Find all favorites for this customer
    const favorites = await Favorite.findAll({
      where: { customerId },
      include: [{
        model: User,
        as: 'restaurant',
        attributes: ['id', 'name', 'email', 'location', 'description', 'profilePicture', 'timings', 'contactInfo']
      }]
    });
    
    // Map to get just the restaurant data
    const restaurants = favorites.map(fav => fav.get('restaurant'));
    
    res.status(200).json(restaurants);
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ message: 'Error getting favorites' });
  }
}; 