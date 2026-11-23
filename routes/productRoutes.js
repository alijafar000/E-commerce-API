import express from 'express'
import { protect } from '../middleware/authMiddleware.js'
import { authorize } from '../middleware/roleMiddleware.js'
import {
    createProduct, deleteProduct, deleteProductImage, filterProducts,
    getAllProducts, getLowStockProducts, getOutOfStockProducts,
    getSpecificProduct, searchProduct, updateProduct, updateStock,
    uploadProductImages
} from '../controllers/productController.js'
import { checkProductOwnership } from '../middleware/productMiddleware.js'
import upload from '../middleware/uploadMiddleware.js'

const router = express.Router()

/**
 * @swagger
 * /api/product:
 *   post:
 *     summary: Create product (Admin/Seller)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProductRequest'
 *     responses:
 *       201:
 *         description: Product created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: 'Product create successfully' }
 *                 product: { $ref: '#/components/schemas/Product' }
 *       400:
 *         description: Missing fields / negative values / invalid discount
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden (not admin/seller)
 */
router.post('/', protect, authorize("admin", "seller"), createProduct)

/**
 * @swagger
 * /api/product:
 *   get:
 *     summary: Get all active products (public)
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [price_asc, price_desc, rating_desc, newest, oldest, name_asc, name_desc]
 *         description: Sort order (default newest)
 *     responses:
 *       200:
 *         description: Products list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 count: { type: number, example: 20 }
 *                 sort: { type: string, example: 'newest' }
 *                 products:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Product' }
 */
router.get('/', getAllProducts)

/**
 * @swagger
 * /api/product/search:
 *   get:
 *     summary: Search products by keyword
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: keyword
 *         required: true
 *         schema: { type: string }
 *         description: Search term (name, description, category, brand)
 *     responses:
 *       200:
 *         description: Matching products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 count: { type: number }
 *                 products:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Product' }
 *       400:
 *         description: Keyword required
 */
router.get('/search', searchProduct)

/**
 * @swagger
 * /api/product/filter:
 *   get:
 *     summary: Filter products by various criteria
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: brand
 *         schema: { type: string }
 *       - in: query
 *         name: minPrice
 *         schema: { type: number }
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *       - in: query
 *         name: minRating
 *         schema: { type: number }
 *       - in: query
 *         name: inStock
 *         schema: { type: string, enum: ['true', 'false'] }
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [price_asc, price_desc, rating_desc, newest, oldest, name_asc, name_desc]
 *     responses:
 *       200:
 *         description: Filtered products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 count: { type: number }
 *                 filters: { type: object }
 *                 products:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Product' }
 *       400:
 *         description: Invalid numeric params
 */
router.get('/filter', filterProducts)

/**
 * @swagger
 * /api/product/inventory/low-stock:
 *   get:
 *     summary: Admin - Get low-stock products
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: threshold
 *         schema: { type: integer, default: 10 }
 *         description: Stock threshold (inclusive)
 *     responses:
 *       200:
 *         description: Low-stock products list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 count: { type: number }
 *                 threshold: { type: number }
 *                 products:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Product' }
 *       400:
 *         description: Invalid threshold
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden (not admin)
 */
router.get('/inventory/low-stock', protect, authorize("admin"), getLowStockProducts)

/**
 * @swagger
 * /api/product/inventory/out-of-stock:
 *   get:
 *     summary: Admin - Get out-of-stock products
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Out-of-stock products list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 count: { type: number }
 *                 products:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Product' }
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden (not admin)
 */
router.get('/inventory/out-of-stock', protect, authorize("admin"), getOutOfStockProducts)

/**
 * @swagger
 * /api/product/{id}:
 *   get:
 *     summary: Get a single product by ID (public)
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 product: { $ref: '#/components/schemas/Product' }
 *       400:
 *         description: Invalid product ID
 *       404:
 *         description: Product not found
 */
router.get('/:id', getSpecificProduct)

/**
 * @swagger
 * /api/product/{id}:
 *   put:
 *     summary: Update product (Admin / Owner Seller)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProductRequest'
 *     responses:
 *       200:
 *         description: Product updated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Product' }
 *       400:
 *         description: Invalid values / cast error
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not allowed to manage this product
 *       404:
 *         description: Product not found
 */
router.put('/:id', protect, authorize("admin", "seller"), checkProductOwnership, updateProduct)

/**
 * @swagger
 * /api/product/{id}:
 *   delete:
 *     summary: Soft-delete product (Admin / Owner Seller)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Product deleted (isActive=false)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SuccessResponse' }
 *       400:
 *         description: Invalid product ID
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not allowed
 *       404:
 *         description: Product not found
 */
router.delete('/:id', protect, authorize("admin", "seller"), checkProductOwnership, deleteProduct)

/**
 * @swagger
 * /api/product/{id}/images:
 *   post:
 *     summary: Upload product images (max 5, ≤5MB each, image/* only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [images]
 *             properties:
 *               images:
 *                 type: array
 *                 maxItems: 5
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Images uploaded (Cloudinary)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string }
 *                 images:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       url: { type: string }
 *                       publicId: { type: string }
 *                 product: { $ref: '#/components/schemas/Product' }
 *       400:
 *         description: No images / invalid type / too large
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not allowed
 *       404:
 *         description: Product not found
 */
router.post('/:id/images', protect, authorize("admin", "seller"), checkProductOwnership, upload.array("images", 5), uploadProductImages)

/**
 * @swagger
 * /api/product/{id}/images/{imageId}:
 *   delete:
 *     summary: Delete a product image (from Cloudinary + DB)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Image deleted
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Product' }
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Not allowed
 *       404:
 *         description: Product or image not found
 *       500:
 *         description: Cloudinary delete failed
 */
router.delete(
    "/:id/images/:imageId",
    protect,
    authorize("admin", "seller"),
    checkProductOwnership,
    deleteProductImage
);

/**
 * @swagger
 * /api/product/{productId}/stock:
 *   patch:
 *     summary: Admin - Update product stock
 *     tags: [Products]
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
 *             type: object
 *             required: [stock]
 *             properties:
 *               stock: { type: integer, minimum: 0, example: 100 }
 *     responses:
 *       200:
 *         description: Stock updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string }
 *                 product:
 *                   type: object
 *                   properties:
 *                     _id: { type: string }
 *                     name: { type: string }
 *                     stock: { type: number }
 *                     isActive: { type: boolean }
 *       400:
 *         description: Invalid ID / stock must be non-negative integer
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Product not found
 */
router.patch('/:productId/stock', protect, authorize("admin"), updateStock)

export default router