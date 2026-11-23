import mongoose from "mongoose";
import Product from "../models/Product.js";
import Cart from "../models/Cart.js";
import { calculateCartTotals } from "../utils/cartCalculator.js";

// Add Product to Cart
export const addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        // 1. Validate product ID
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }

        // 2. Validate quantity
        if (!Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be a positive integer",
            });
        }

        // 3. Find active product
        const product = await Product.findOne({
            _id: productId,
            isActive: true,
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        // 4. Check stock
        if (quantity > product.stock) {
            return res.status(400).json({
                success: false,
                message: `Only ${product.stock} items are available in stock`,
            });
        }

        // 5. Find user's cart
        let cart = await Cart.findOne({
            user: req.user.userId,
        });

        // 6. If cart doesn't exist, create new cart
        if (!cart) {
            cart = await Cart.create({
                user: req.user.userId,
                items: [
                    {
                        product: productId,
                        quantity,
                    },
                ],
            });

            await cart.populate("items.product");

            return res.status(201).json({
                success: true,
                message: "Product added to cart",
                cart,
            });
        }

        // 7. Check if product already exists in cart
        const existingItem = cart.items.find(
            (item) => item.product.toString() === productId
        );

        // 8. If product already exists
        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;

            // Check total quantity against stock
            if (newQuantity > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Only ${product.stock} items are available in stock. You already have ${existingItem.quantity} in your cart.`,
                });
            }

            existingItem.quantity = newQuantity;
        } else {
            // 9. Add new product to cart
            cart.items.push({
                product: productId,
                quantity,
            });
        }

        // 10. Save cart
        await cart.save();

        // 11. Populate product details
        await cart.populate("items.product");

        return res.status(200).json({
            success: true,
            message: "Product added to cart",
            cart,
        });
    } catch (error) {
        console.error("Add to cart error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to add product to cart",
        });
    }
};

//get cart
export const getMyCart = async (req, res) => {
    try {
        // Find cart of logged-in user
        const cart = await Cart.findOne({
            user: req.user.userId,
        }).populate("items.product");

        const stockIssues = cart.items
            .filter((item) => item.product && item.quantity > item.product.stock)
            .map((item) => ({
                productId: item.product._id,
                productName: item.product.name,
                cartQuantity: item.quantity,
                availableStock: item.product.stock,
            }));

        // Cart doesn't exist
        if (!cart) {
            return res.status(200).json({
                success: true,
                message: "Cart is empty",
                cart: {
                    items: [],
                },
                totals: {
                    items: [],
                    subtotal: 0,
                    discount: 0,
                    total: 0,
                },
            });
        }

        const totals = calculateCartTotals(cart.items);

        return res.status(200).json({
            success: true,
            message: "Cart fetched successfully",
            // cart,
            stockIssues,
            totals
        });
    } catch (error) {
        console.error("Get cart error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch cart",
        });
    }
};

//update cart
export const updateCartQuantity = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;

        // 1. Validate product ID
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }

        // 2. Validate quantity
        if (!Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be a positive integer",
            });
        }

        // 3. Find user's cart
        const cart = await Cart.findOne({
            user: req.user.userId,
        });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found",
            });
        }

        // 4. Find item in cart
        const cartItem = cart.items.find(
            (item) => item.product.toString() === productId
        );

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: "Product is not in your cart",
            });
        }

        // 5. Find active product
        const product = await Product.findOne({
            _id: productId,
            isActive: true,
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        // 6. Check stock
        if (quantity > product.stock) {
            return res.status(400).json({
                success: false,
                message: `Only ${product.stock} items are available in stock`,
            });
        }

        // 7. Update quantity
        cartItem.quantity = quantity;

        // 8. Save cart
        await cart.save();

        // 9. Populate product details
        await cart.populate("items.product");

        return res.status(200).json({
            success: true,
            message: "Cart quantity updated successfully",
            cart,
        });
    } catch (error) {
        console.error("Update cart quantity error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update cart quantity",
        });
    }
};

// remove cart
export const removeCartItem = async (req, res) => {
    try {
        const { productId } = req.params;

        // 1. Validate product ID
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }

        // 2. Find user's cart
        const cart = await Cart.findOne({
            user: req.user.userId,
        });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found",
            });
        }

        // 3. Find product in cart
        const itemIndex = cart.items.findIndex(
            (item) => item.product.toString() === productId
        );

        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Product is not in your cart",
            });
        }

        // 4. Remove item
        cart.items.splice(itemIndex, 1);

        // 5. Save cart
        await cart.save();

        // 6. Populate product details
        await cart.populate("items.product");

        return res.status(200).json({
            success: true,
            message: "Product removed from cart successfully",
            cart,
        });
    } catch (error) {
        console.error("Remove cart item error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to remove product from cart",
        });
    }
};

//clear all cart
export const clearCart = async (req, res) => {
    try {
        // 1. Find logged-in user's cart
        const cart = await Cart.findOne({
            user: req.user.userId,
        });

        // 2. Cart doesn't exist
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found",
            });
        }

        // 3. Remove all items
        cart.items = [];

        // 4. Save cart
        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Cart cleared successfully",
            cart,
        });
    } catch (error) {
        console.error("Clear cart error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to clear cart",
        });
    }
};