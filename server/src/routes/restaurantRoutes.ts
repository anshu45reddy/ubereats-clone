import express from 'express';
import {
  addDish,
  updateDish,
  deleteDish,
  getDishes,
  getOrders,
  updateOrderStatus,
} from '../controllers/restaurantController';
import { isAuthenticated, isRestaurant } from '../middleware/auth';

const router = express.Router();

// Apply restaurant authentication middleware to all routes
router.use(isAuthenticated, isRestaurant);

/**
 * @swagger
 * /api/restaurants/dishes:
 *   post:
 *     tags:
 *       - Restaurant
 *     summary: Add a new dish
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - price
 *               - category
 *               - ingredients
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               image:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [Appetizer, Salad, Main Course, Dessert, Beverage]
 *               ingredients:
 *                 type: string
 *     responses:
 *       201:
 *         description: Dish created successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized as restaurant
 *       500:
 *         description: Server error
 */
router.post('/dishes', addDish);

/**
 * @swagger
 * /api/restaurants/dishes/{id}:
 *   put:
 *     tags:
 *       - Restaurant
 *     summary: Update a dish
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               image:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [Appetizer, Salad, Main Course, Dessert, Beverage]
 *               ingredients:
 *                 type: string
 *     responses:
 *       200:
 *         description: Dish updated successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized as restaurant
 *       404:
 *         description: Dish not found
 *       500:
 *         description: Server error
 */
router.put('/dishes/:id', updateDish);

/**
 * @swagger
 * /api/restaurants/dishes/{id}:
 *   delete:
 *     tags:
 *       - Restaurant
 *     summary: Delete a dish
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Dish deleted successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized as restaurant
 *       404:
 *         description: Dish not found
 *       500:
 *         description: Server error
 */
router.delete('/dishes/:id', deleteDish);

/**
 * @swagger
 * /api/restaurants/dishes:
 *   get:
 *     tags:
 *       - Restaurant
 *     summary: Get all dishes for the restaurant
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: List of dishes
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized as restaurant
 *       500:
 *         description: Server error
 */
router.get('/dishes', getDishes);

/**
 * @swagger
 * /api/restaurants/orders:
 *   get:
 *     tags:
 *       - Restaurant
 *     summary: Get all orders for the restaurant
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [New, Order Received, Preparing, On the Way, Pick-up Ready, Delivered, Picked Up, Cancelled]
 *     responses:
 *       200:
 *         description: List of orders
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized as restaurant
 *       500:
 *         description: Server error
 */
router.get('/orders', getOrders);

/**
 * @swagger
 * /api/restaurants/orders/{id}/status:
 *   put:
 *     tags:
 *       - Restaurant
 *     summary: Update order status
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [New, Order Received, Preparing, On the Way, Pick-up Ready, Delivered, Picked Up, Cancelled]
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized as restaurant
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.put('/orders/:id/status', updateOrderStatus);

export default router; 