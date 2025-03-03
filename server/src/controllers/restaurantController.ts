import { Request, Response } from 'express';
import Dish from '../models/Dish';
import { Order, OrderItem } from '../models/Order';
import User from '../models/User';

// Dish Management
export const addDish = async (req: Request, res: Response) => {
  try {
    const restaurantId = req.session.userId;
    const dish = await Dish.create({
      ...req.body,
      restaurantId,
    });

    res.status(201).json({
      message: 'Dish added successfully',
      dish,
    });
  } catch (error) {
    console.error('Add dish error:', error);
    res.status(500).json({ message: 'Error adding dish' });
  }
};

export const updateDish = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const restaurantId = req.session.userId;

    const dish = await Dish.findOne({
      where: { id, restaurantId },
    });

    if (!dish) {
      return res.status(404).json({ message: 'Dish not found' });
    }

    await dish.update(req.body);

    res.json({
      message: 'Dish updated successfully',
      dish,
    });
  } catch (error) {
    console.error('Update dish error:', error);
    res.status(500).json({ message: 'Error updating dish' });
  }
};

export const deleteDish = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const restaurantId = req.session.userId;

    const dish = await Dish.findOne({
      where: { id, restaurantId },
    });

    if (!dish) {
      return res.status(404).json({ message: 'Dish not found' });
    }

    await dish.destroy();

    res.json({ message: 'Dish deleted successfully' });
  } catch (error) {
    console.error('Delete dish error:', error);
    res.status(500).json({ message: 'Error deleting dish' });
  }
};

export const getDishes = async (req: Request, res: Response) => {
  try {
    const restaurantId = req.session.userId;
    const dishes = await Dish.findAll({
      where: { restaurantId },
    });

    // Convert to plain objects and ensure numeric values
    const plainDishes = dishes.map(dish => {
      const plainDish = dish.toJSON();
      
      // Ensure price is a number
      plainDish.price = parseFloat(plainDish.price.toString());
      
      return plainDish;
    });

    res.json({ dishes: plainDishes });
  } catch (error) {
    console.error('Get dishes error:', error);
    res.status(500).json({ message: 'Error fetching dishes' });
  }
};

// Order Management
export const getOrders = async (req: Request, res: Response) => {
  try {
    const restaurantId = req.session.userId;
    if (!restaurantId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { status } = req.query;
    const where: any = { restaurantId };

    if (status) {
      where.status = status;
    }

    const orders = await Order.findAll({
      where,
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Dish, as: 'dish' }],
        },
        { model: User, as: 'customer', attributes: { exclude: ['password'] } },
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
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const restaurantId = req.session.userId;

    const order = await Order.findOne({
      where: { id, restaurantId },
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await order.update({ status });

    res.json({
      message: 'Order status updated successfully',
      order,
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Error updating order status' });
  }
}; 