import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
    addToWishlist,
    getWishlist,
    removeFromWishlist,
    clearWishlist
} from "../controllers/wishlistController.js";

const router = express.Router();

/**
 * @swagger
 * /api/wishlist:
 *   get:
 *     summary: Get logged-in user's wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wishlist fetched (active products only)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 count: { type: number, example: 3 }
 *                 products:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Product' }
 *       401:
 *         description: Not authorized
 */
router.get("/", protect, getWishlist);

/**
 * @swagger
 * /api/wishlist/{productId}:
 *   post:
 *     summary: Add product to wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Product added (existing wishlist)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Wishlist' }
 *       201:
 *         description: Product added (new wishlist created)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Wishlist' }
 *       400:
 *         description: Invalid product ID
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Product not found/unavailable
 *       409:
 *         description: Product already in wishlist
 */
router.post("/:productId", protect, addToWishlist);

/**
 * @swagger
 * /api/wishlist/{productId}:
 *   delete:
 *     summary: Remove a product from wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Product removed
 *       400:
 *         description: Invalid product ID
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Wishlist or product not in wishlist
 */
router.delete("/:productId", protect, removeFromWishlist);

/**
 * @swagger
 * /api/wishlist:
 *   delete:
 *     summary: Clear entire wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wishlist cleared (or already empty)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SuccessResponse' }
 *       401:
 *         description: Not authorized
 */
router.delete("/", protect, clearWishlist);

export default router;