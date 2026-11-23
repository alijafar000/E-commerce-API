import mongoose from "mongoose";
import Review from "../models/Review.js";
import Product from "../models/Product.js";

// Helper function: Update product rating and review count
const updateProductRating = async (productId) => {
    const result = await Review.aggregate([
        {
            $match: {
                product: new mongoose.Types.ObjectId(productId)
            }
        },
        {
            $group: {
                _id: "$product",
                averageRating: { $avg: "$rating" },
                totalReviews: { $sum: 1 }
            }
        }
    ]);

    if (result.length > 0) {
        await Product.findByIdAndUpdate(productId, {
            rating: Number(result[0].averageRating.toFixed(1)),
            numReviews: result[0].totalReviews
        });
    } else {
        await Product.findByIdAndUpdate(productId, {
            rating: 0,
            numReviews: 0
        });
    }
};


//Add a review
export const addReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const { productId } = req.params;

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        if (
            !Number.isInteger(rating) ||
            rating < 1 ||
            rating > 5
        ) {
            return res.status(400).json({
                success: false,
                message: "Rating must be an integer between 1 and 5"
            });
        }

        if (
            typeof comment !== "string" ||
            comment.trim().length < 3 ||
            comment.trim().length > 1000
        ) {
            return res.status(400).json({
                success: false,
                message: "Comment must be between 3 and 1000 characters"
            });
        }

        const product = await Product.findById(productId);

        if (!product || !product.isActive) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const existingReview = await Review.findOne({
            product: productId,
            user: req.user.userId
        });

        if (existingReview) {
            return res.status(409).json({
                success: false,
                message: "You have already reviewed this product"
            });
        }

        const review = await Review.create({
            product: productId,
            user: req.user.userId,
            rating,
            comment: comment.trim()
        });

        await updateProductRating(productId);

        return res.status(201).json({
            success: true,
            message: "Review added successfully",
            review
        });

    } catch (error) {
        // Handles duplicate reviews, including concurrent requests
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "You have already reviewed this product"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Failed to add review",
            error: error.message
        });
    }
};


//Get all reviews for a product
export const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const product = await Product.findById(productId);

        if (!product || !product.isActive) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        const reviews = await Review.find({
            product: productId
        })
            .populate("user", "name")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: reviews.length,
            rating: product.rating,
            numReviews: product.numReviews,
            reviews
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch reviews",
            error: error.message
        });
    }
};


//Update your own review
export const updateReview = async (req, res) => {
    try {
        const { productId } = req.params;
        const { rating, comment } = req.body;

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        if (
            !Number.isInteger(rating) ||
            rating < 1 ||
            rating > 5
        ) {
            return res.status(400).json({
                success: false,
                message: "Rating must be an integer between 1 and 5"
            });
        }

        if (
            typeof comment !== "string" ||
            comment.trim().length < 3 ||
            comment.trim().length > 1000
        ) {
            return res.status(400).json({
                success: false,
                message: "Comment must be between 3 and 1000 characters"
            });
        }

        const review = await Review.findOne({
            product: productId,
            user: req.user.userId
        });

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Your review was not found"
            });
        }

        review.rating = rating;
        review.comment = comment.trim();

        await review.save();
        await updateProductRating(productId);

        return res.status(200).json({
            success: true,
            message: "Review updated successfully",
            review
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update review",
            error: error.message
        });
    }
};


//Delete your own review
export const deleteReview = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        const review = await Review.findOneAndDelete({
            product: productId,
            user: req.user.userId
        });

        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Your review was not found"
            });
        }

        await updateProductRating(productId);

        return res.status(200).json({
            success: true,
            message: "Review deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete review",
            error: error.message
        });
    }
};