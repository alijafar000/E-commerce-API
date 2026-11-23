import express from 'express'
import { protect } from '../middleware/authMiddleware.js';
import { addToCart, clearCart, getMyCart, removeCartItem, updateCartQuantity } from '../controllers/cartController.js';

const router = express.Router();

/**
 * @swagger
 * /api/cart:
 *   post:
 *     summary: Add product to cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddToCartRequest'
 *     responses:
 *       200:
 *         description: Product added to cart (quantity merged if already exists)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: 'Product added to cart' }
 *                 cart: { $ref: '#/components/schemas/Cart' }
 *       201:
 *         description: New cart created with product
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Cart' }
 *       400:
 *         description: Invalid product ID / quantity / insufficient stock
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Product not found
 */
router.post('/', protect, addToCart)

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Get logged-in user's cart with totals
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: 'Cart fetched successfully' }
 *                 stockIssues:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       productId: { type: string }
 *                       productName: { type: string }
 *                       cartQuantity: { type: number }
 *                       availableStock: { type: number }
 *                 totals:
 *                   type: object
 *                   properties:
 *                     subtotal: { type: number, example: 159998 }
 *                     discount: { type: number, example: 15999.8 }
 *                     total: { type: number, example: 143998.2 }
 *       401:
 *         description: Not authorized
 */
router.get('/', protect, getMyCart)

/**
 * @swagger
 * /api/cart/{productId}:
 *   put:
 *     summary: Update product quantity in cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *         description: MongoDB ObjectId of the product
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCartQuantityRequest'
 *     responses:
 *       200:
 *         description: Cart quantity updated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Cart' }
 *       400:
 *         description: Invalid product ID / quantity / stock exceeded
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Cart or product not found
 */
router.put('/:productId', protect, updateCartQuantity)

/**
 * @swagger
 * /api/cart:
 *   delete:
 *     summary: Clear all items from cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Cart' }
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Cart not found
 */
router.delete("/", protect, clearCart);

/**
 * @swagger
 * /api/cart/{productId}:
 *   delete:
 *     summary: Remove a specific product from cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Product removed from cart
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Cart' }
 *       400:
 *         description: Invalid product ID
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Cart or item not found
 */
router.delete('/:productId', protect, removeCartItem)

export default router