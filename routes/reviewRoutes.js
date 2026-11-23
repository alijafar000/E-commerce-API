import express from 'express'
import { protect } from '../middleware/authMiddleware.js';
import { addReview, deleteReview, getProductReviews, updateReview } from '../controllers/reviewController.js';

const router = express.Router();

/**
 * @swagger
 * /api/product/{productId}/reviews:
 *   get:
 *     summary: Get all reviews for a product (public)
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Reviews list with product rating summary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 count: { type: number }
 *                 rating: { type: number, example: 4.5 }
 *                 numReviews: { type: number, example: 120 }
 *                 reviews:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Review' }
 *       400:
 *         description: Invalid product ID
 *       404:
 *         description: Product not found
 */
router.get('/:productId/reviews', getProductReviews)

/**
 * @swagger
 * /api/product/{productId}/reviews:
 *   post:
 *     summary: Add a review for a product (one per user)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddReviewRequest'
 *     responses:
 *       201:
 *         description: Review added
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Review' }
 *       400:
 *         description: Invalid product ID / rating / comment length
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Product not found
 *       409:
 *         description: Already reviewed
 */
router.post('/:productId/reviews', protect, addReview)

/**
 * @swagger
 * /api/product/{productId}/reviews:
 *   put:
 *     summary: Update your own review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddReviewRequest'
 *     responses:
 *       200:
 *         description: Review updated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Review' }
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Your review not found
 */
router.put('/:productId/reviews', protect, updateReview)

/**
 * @swagger
 * /api/product/{productId}/reviews:
 *   delete:
 *     summary: Delete your own review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Review deleted
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SuccessResponse' }
 *       400:
 *         description: Invalid product ID
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Your review not found
 */
router.delete('/:productId/reviews', protect, deleteReview)

export default router;