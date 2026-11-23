import express from 'express'
import { getMe, loginUser, registerUser } from '../controllers/authController.js'
import { protect } from '../middleware/authMiddleware.js'
import { authorize } from '../middleware/roleMiddleware.js'
import { registerValidation } from '../middleware/validator.js'
import { authLimiter } from '../middleware/rateLimiter.js'

const router = express.Router()

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: 'User registered successfully' }
 *                 user: { $ref: '#/components/schemas/User' }
 *       400:
 *         description: Missing fields or validation error
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       409:
 *         description: Email already exists
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       500:
 *         description: Server error
 */
router.post('/register', authLimiter, registerUser)

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user and get JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: 'Login successfull' }
 *                 token: { type: string, example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
 *                 user: { $ref: '#/components/schemas/User' }
 *       400:
 *         description: Missing email/password
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
router.post('/login', authLimiter, loginUser)

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get logged-in user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 user: { $ref: '#/components/schemas/User' }
 *       401:
 *         description: Not authorized / Invalid token
 *       404:
 *         description: User not found
 */
router.get('/me', protect, getMe)

/**
 * @swagger
 * /api/auth/admin-test:
 *   get:
 *     summary: Admin-only test route
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Welcome Admin
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: 'Welcome Admin' }
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden (not admin)
 */
router.get('/admin-test', protect, authorize("admin"), (req, res) => {
    res.json({ success: true, message: "Welcome Admin" })
})

/**
 * @swagger
 * /api/auth/seller-test:
 *   get:
 *     summary: Admin/Seller test route
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Welcome Admin/Seller
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: 'Welcome Admin/Seller' }
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden (not admin/seller)
 */
router.get('/seller-test', protect, authorize("admin", "seller"), (req, res) => {
    res.json({ success: true, message: "Welcome Admin/Seller" })
})

export default router