import mongoose from "mongoose";
import Wishlist from "../models/Wishlist.js";
import Product from "../models/Product.js";

//Add product to wishlist
export const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user.userId;

        
        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        
        const product = await Product.findOne({
            _id: productId,
            isActive: true
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found or unavailable"
            });
        }

        
        let wishlist = await Wishlist.findOne({ user: userId });

        if (!wishlist) {
            wishlist = await Wishlist.create({
                user: userId,
                products: [productId]
            });

            return res.status(201).json({
                success: true,
                message: "Product added to wishlist",
                wishlist
            });
        }

        // Prevent duplicate products
        const alreadyExists = wishlist.products.some(
            (id) => id.toString() === productId
        );

        if (alreadyExists) {
            return res.status(409).json({
                success: false,
                message: "Product already exists in wishlist"
            });
        }

        wishlist.products.push(productId);
        await wishlist.save();

        return res.status(200).json({
            success: true,
            message: "Product added to wishlist",
            wishlist
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to add product to wishlist",
            error: error.message
        });
    }
};


//Get user's wishlist
export const getWishlist = async (req, res) => {
    try {
        const userId = req.user.userId;

        const wishlist = await Wishlist.findOne({ user: userId })
            .populate({
                path: "products",
                select: "name description price discount category brand images rating numReviews stock isActive"
            });

        if (!wishlist) {
            return res.status(200).json({
                success: true,
                message: "Wishlist is empty",
                products: []
            });
        }

    
        const activeProducts = wishlist.products.filter(
            (product) => product && product.isActive
        );

        return res.status(200).json({
            success: true,
            count: activeProducts.length,
            products: activeProducts
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch wishlist",
            error: error.message
        });
    }
};


//Remove a product from wishlist
export const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user.userId;

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const wishlist = await Wishlist.findOne({ user: userId });

        if (!wishlist) {
            return res.status(404).json({
                success: false,
                message: "Wishlist not found"
            });
        }

        const productExists = wishlist.products.some(
            (id) => id.toString() === productId
        );

        if (!productExists) {
            return res.status(404).json({
                success: false,
                message: "Product not found in wishlist"
            });
        }

        wishlist.products = wishlist.products.filter(
            (id) => id.toString() !== productId
        );

        await wishlist.save();

        return res.status(200).json({
            success: true,
            message: "Product removed from wishlist",
            products: wishlist.products
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to remove product from wishlist",
            error: error.message
        });
    }
};


// 4. Clear entire wishlist
export const clearWishlist = async (req, res) => {
    try {
        const userId = req.user.userId;

        const wishlist = await Wishlist.findOne({ user: userId });

        if (!wishlist) {
            return res.status(200).json({
                success: true,
                message: "Wishlist is already empty"
            });
        }

        wishlist.products = [];
        await wishlist.save();

        return res.status(200).json({
            success: true,
            message: "Wishlist cleared successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to clear wishlist",
            error: error.message
        });
    }
};