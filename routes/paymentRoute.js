import express from 'express'
import { protect } from '../middleware/authMiddleware.js';
import { createRazorpayOrder, verifyRazorpayPayment } from '../controllers/razorpayController.js';
import { paymentLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * @swagger
 * /api/payment/create-razorpay-order:
 *   post:
 *     summary: Create Razorpay order (online payment)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRazorpayOrderRequest'
 *     responses:
 *       201:
 *         description: Razorpay order created, stock reserved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: 'Razorpay order created successfully' }
 *                 orderId: { type: string }
 *                 razorpayOrderId: { type: string, example: 'order_Nxxxxx' }
 *                 amount: { type: number, example: 14399820 }
 *                 currency: { type: string, example: 'INR' }
 *                 keyId: { type: string, example: 'rzp_test_xxxxx' }
 *       400:
 *         description: Missing address / empty cart / invalid total
 *       401:
 *         description: Not authorized
 *       409:
 *         description: Stock changed during checkout
 *       500:
 *         description: Razorpay creation failed
 */
router.post('/create-razorpay-order', protect, paymentLimiter, createRazorpayOrder)

/**
 * @swagger
 * /api/payment/verify-razorpay-payment:
 *   post:
 *     summary: Verify Razorpay payment signature and confirm order
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyRazorpayPaymentRequest'
 *     responses:
 *       200:
 *         description: Payment verified & order confirmed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: 'Payment verified and order confirmed successfully' }
 *                 order: { $ref: '#/components/schemas/Order' }
 *       400:
 *         description: Missing fields / invalid signature
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Order not found
 *       409:
 *         description: Inventory already released
 */
router.post('/verify-razorpay-payment', protect, paymentLimiter, verifyRazorpayPayment)

export default router;