import express from 'express';
import {
  getRestaurants,
  getRestaurantDetails,
  createOrder,
  getCustomerOrders,
  addFavorite,
  removeFavorite,
  getFavorites,
} from '../controllers/customerController';
import { isAuthenticated, isCustomer } from '../middleware/auth';

const router = express.Router();

// Apply customer authentication middleware to protected routes
router.get('/restaurants', getRestaurants); // Public route
router.get('/restaurants/:id', getRestaurantDetails); // Public route

router.use(isAuthenticated, isCustomer); // Protected routes below

/**
 * @swagger
 * /api/customers/orders:
 *   post:
 *     tags:
 *       - Customer
 *     summary: Create a new order
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - restaurantId
 *               - items
 *             properties:
 *               restaurantId:
 *                 type: integer
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - dishId
 *                     - quantity
 *                   properties:
 *                     dishId:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *     responses:
 *       201:
 *         description: Order created successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized as customer
 *       404:
 *         description: Restaurant or dish not found
 *       500:
 *         description: Server error
 */
router.post('/orders', createOrder);

/**
 * @swagger
 * /api/customers/orders:
 *   get:
 *     tags:
 *       - Customer
 *     summary: Get customer's orders
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: List of orders
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized as customer
 *       500:
 *         description: Server error
 */
router.get('/orders', getCustomerOrders);

/**
 * @swagger
 * /api/customers/favorites:
 *   post:
 *     tags:
 *       - Customer
 *     summary: Add restaurant to favorites
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - restaurantId
 *             properties:
 *               restaurantId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Restaurant added to favorites
 *       400:
 *         description: Restaurant already in favorites
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized as customer
 *       500:
 *         description: Server error
 */
router.post('/favorites', addFavorite);

/**
 * @swagger
 * /api/customers/favorites/{restaurantId}:
 *   delete:
 *     tags:
 *       - Customer
 *     summary: Remove restaurant from favorites
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Restaurant removed from favorites
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized as customer
 *       404:
 *         description: Favorite not found
 *       500:
 *         description: Server error
 */
router.delete('/favorites/:restaurantId', removeFavorite);

/**
 * @swagger
 * /api/customers/favorites:
 *   get:
 *     tags:
 *       - Customer
 *     summary: Get customer's favorite restaurants
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: List of favorite restaurants
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized as customer
 *       500:
 *         description: Server error
 */
router.get('/favorites', getFavorites);

export default router; 