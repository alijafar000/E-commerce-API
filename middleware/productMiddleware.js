import Product from "../models/Product.js";

export const checkProductOwnership = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product || !product.isActive) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        // Admin can manage any product
        if (req.user.role === "admin") {
            req.product = product;
            return next();
        }

        // Seller can manage only their own product
        if (
            req.user.role === "seller" &&
            product.seller.toString() === req.user.userId.toString()
        ) {
            req.product = product;
            return next();
        }

        return res.status(403).json({
            success: false,
            message: "You are not allowed to manage this product",
        });

    } catch (error) {
        console.error("Product ownership error:", error);

        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }

        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};



