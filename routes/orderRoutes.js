import express from 'express'
import { protect } from '../middleware/authMiddleware.js';
import { cancelOrder, createOrder, getAllOrders, getMyOrders, getSingleOrder, updateOrderStatus } from '../controllers/orderController.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/order:
 *   post:
 *     summary: Create order from cart (COD)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrderRequest'
 *     responses:
 *       201:
 *         description: Order placed successfully, stock reduced, cart cleared
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: 'Order placed successfully' }
 *                 order: { $ref: '#/components/schemas/Order' }
 *       400:
 *         description: Missing address / empty cart / insufficient stock
 *       401:
 *         description: Not authorized
 *       409:
 *         description: Stock changed while placing order
 */
router.post('/', protect, createOrder)

/**
 * @swagger
 * /api/order/my-orders:
 *   get:
 *     summary: Get all orders of logged-in user
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Orders fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 count: { type: number, example: 3 }
 *                 orders:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Order' }
 *       401:
 *         description: Not authorized
 */
router.get('/my-orders', protect, getMyOrders)

/**
 * @swagger
 * /api/order/admin/all:
 *   get:
 *     summary: Admin - Get all orders in system
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All orders fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 count: { type: number }
 *                 orders:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Order' }
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden (not admin)
 */
router.get('/admin/all', protect, authorize("admin"), getAllOrders)

/**
 * @swagger
 * /api/order/{orderId}:
 *   get:
 *     summary: Get single order by ID (owner only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Order details fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 order: { $ref: '#/components/schemas/Order' }
 *       400:
 *         description: Invalid order ID
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Order not found
 */
router.get('/:orderId', protect, getSingleOrder)

/**
 * @swagger
 * /api/order/{orderId}/cancel:
 *   patch:
 *     summary: Cancel own order (restores stock)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Order cancelled and stock restored
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: 'Order cancelled successfully' }
 *                 order: { $ref: '#/components/schemas/Order' }
 *       400:
 *         description: Order not cancellable (already shipped/delivered/cancelled) / Invalid ID
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Order not found
 */
router.patch('/:orderId/cancel', protect, cancelOrder)

/**
 * @swagger
 * /api/order/{orderId}/status:
 *   patch:
 *     summary: Admin - Update order status (validated flow)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateOrderStatusRequest'
 *     responses:
 *       200:
 *         description: Order status updated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Order' }
 *       400:
 *         description: Invalid status or invalid transition / final status
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden (not admin)
 *       404:
 *         description: Order not found
 */
router.patch('/:orderId/status', protect, authorize("admin"), updateOrderStatus)

export default router;