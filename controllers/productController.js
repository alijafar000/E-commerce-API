import Product from "../models/Product.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";
import deleteFromCloudinary from "../utils/deleteFromCloudinary.js";
import mongoose from "mongoose";

//helper fn
const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

export const createProduct = async (req, res) => {
    try {
        const { name, description, price, discount, category, brand, stock } = req.body;

        if (!name || !description || !price || !discount || !category || !brand || stock === undefined) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required product fields"
            })
        }

        if (Number(price) < 0) {
            return res.status(400).json({
                success: false,
                message: "Price cannot be negative",
            });
        }

        if (Number(stock) < 0) {
            return res.status(400).json({
                success: false,
                message: "Stock cannot be negative",
            });
        }

        if (
            discount !== undefined &&
            (Number(discount) < 0 || Number(discount) > 100)
        ) {
            return res.status(400).json({
                success: false,
                message: "Discount must be between 0 and 100",
            });
        }

        const product = await Product.create({
            name: name.trim(),
            description: description.trim(),
            price: Number(price),
            discount: discount !== undefined ? Number(discount) : 0,
            category: category.trim(),
            brand: brand.trim(),
            stock: Number(stock),
            seller: req.user.userId,
        });

        res.status(201).json({
            success: true,
            message: "Product create successfully",
            product
        })
    } catch (error) {
        console.log("Product create error", error)
        res.status(500).json({
            success: false,
            message: "Server error"
        })
    }
}

export const getAllProducts = async (req, res) => {
    try {
        const { sort } = req.query;

        let sortOption = { createdAt: -1 };

        switch (sort) {
            case "price_asc":
                sortOption = { price: 1 };
                break;

            case "price_desc":
                sortOption = { price: -1 };
                break;

            case "rating_desc":
                sortOption = { rating: -1 };
                break;

            case "newest":
                sortOption = { createdAt: -1 };
                break;

            case "oldest":
                sortOption = { createdAt: 1 };
                break;

            case "name_asc":
                sortOption = { name: 1 };
                break;

            case "name_desc":
                sortOption = { name: -1 };
                break;

            default:
                sortOption = { createdAt: -1 };
        }

        const products = await Product.find({
            isActive: true,
        }).sort(sortOption);

        return res.status(200).json({
            success: true,
            count: products.length,
            sort: sort || "newest",
            products,
        });

    } catch (error) {
        console.error("Get products error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch products",
            error: error.message,
        });
    }
};

export const getSpecificProduct = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }
        const product = await Product.findOne({
            _id: id,
            isActive: true
        })

        if (!product || !product.isActive) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            })
        }

        res.status(200).json({
            success: true,
            message: "Fetched specific product",
            product
        })
    } catch (error) {
        console.log("Get product by id error", error)
        // Invalid MongoDB ObjectId
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }
        res.status(500).json({
            success: false,
            message: "Server error"
        })
    }
}

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id)

        if (!product || !product.isActive) {
            return res.status(404).json({
                success: false,
                message: "Product not found."
            })
        }

        const { name, description, price, discount, category, brand, stock } = req.body;

        if (name !== undefined) product.name = name;
        if (description !== undefined) product.description = description;
        if (price !== undefined) product.price = price;
        if (discount !== undefined) product.discount = discount;
        if (category !== undefined) product.category = category;
        if (brand !== undefined) product.brand = brand;
        if (stock !== undefined) product.stock = stock;

        if (price !== undefined && Number(price) < 0) {
            return res.status(400).json({
                success: false,
                message: "Price cannot be negative",
            });
        }

        if (stock !== undefined && Number(stock) < 0) {
            return res.status(400).json({
                success: false,
                message: "Stock cannot be negative",
            });
        }

        if (
            discount !== undefined &&
            (Number(discount) < 0 || Number(discount) > 100)
        ) {
            return res.status(400).json({
                success: false,
                message: "Discount must be between 0 and 100",
            });
        }

        const updatedProduct = await product.save()
        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product: updatedProduct
        })

    } catch (error) {
        console.log("Prodcut update error", error)

        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }

        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
        res.status(500).json({
            success: false,
            message: "Server error"
        })
    }
}

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id)

        if (!product || !product.isActive) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            })
        }

        product.isActive = false;
        await product.save()

        res.status(200).json({
            success: true,
            message: "Product deleted successfully",
        });

    } catch (error) {
        console.log("Delete product error", error)

        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid Product Id"
            })
        }
    }
}

export const uploadProductImages = async (req, res) => {
    try {
        console.log("1. Upload controller started");

        const product = req.product;

        console.log("2. Product found:", product._id);

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please upload at least one image",
            });
        }

        console.log("3. Files received:", req.files.length);

        const uploadResults = await Promise.all(
            req.files.map((file) =>
                uploadToCloudinary(
                    file.buffer,
                    file.mimetype,
                    "ecommerce/products"
                )
            )
        );

        console.log("4. Cloudinary upload results received");

        const images = uploadResults.map((result) => ({
            url: result.secure_url,
            publicId: result.public_id,
        }));

        console.log("5. Images:", images);

        product.images.push(...images);

        console.log("6. Saving product to MongoDB...");

        const updatedProduct = await product.save();

        console.log("7. Product saved successfully");

        return res.status(200).json({
            success: true,
            message: "Product images uploaded successfully",
            images,
            product: updatedProduct,
        });

    } catch (error) {
        console.error("Product image upload error:", error);

        return res.status(500).json({
            success: false,
            message: "Image upload failed",
            error: error.message,
        });
    }
};

export const deleteProductImage = async (req, res) => {
    try {
        const product = req.product;

        const { imageId } = req.params;

        const image = product.images.id(imageId);

        if (!image) {
            return res.status(404).json({
                success: false,
                message: "Product image not found",
            });
        }

        console.log("Deleting image:", image.publicId);

        // 1. Delete from Cloudinary
        const cloudinaryResult = await deleteFromCloudinary(
            image.publicId
        );

        if (
            cloudinaryResult.result !== "ok" &&
            cloudinaryResult.result !== "not found"
        ) {
            return res.status(500).json({
                success: false,
                message: "Failed to delete image from Cloudinary",
            });
        }

        // 2. Remove image from MongoDB
        image.deleteOne();

        await product.save();

        return res.status(200).json({
            success: true,
            message: "Product image deleted successfully",
            product,
        });

    } catch (error) {
        console.error("Delete product image error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete product image",
            error: error.message,
        });
    }
};

export const searchProduct = async (req, res) => {
    try {
        const { keyword } = req.query;

        if (!keyword || keyword.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Search keyword is required"
            })
        }

        const searchRegex = new RegExp(keyword.trim(), "i")

        const products = await Product.find({
            isActive: true,
            $or: [
                { name: searchRegex },
                { description: searchRegex },
                { category: searchRegex },
                { brand: searchRegex }
            ],
        })

        return res.status(200).json({
            success: true,
            count: products.length,
            products
        })
    } catch (error) {
        console.error("Search products error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to search products",
            error: error.message,
        });
    }
}

export const filterProducts = async (req, res) => {
    try {
        const {
            category,
            brand,
            minPrice,
            maxPrice,
            minRating,
            inStock,
            sort,
        } = req.query;

        const filter = {
            isActive: true,
        };

        // Category filter
        if (category) {
            filter.category = new RegExp(`^${category.trim()}$`, "i");
        }

        // Brand filter
        if (brand) {
            filter.brand = new RegExp(`^${brand.trim()}$`, "i");
        }

        // Price filter
        if (minPrice || maxPrice) {
            filter.price = {};

            if (minPrice) {
                filter.price.$gte = Number(minPrice);
            }

            if (maxPrice) {
                filter.price.$lte = Number(maxPrice);
            }
        }

        // Rating filter
        if (minRating) {
            filter.rating = {
                $gte: Number(minRating),
            };
        }

        // Stock filter
        if (inStock === "true") {
            filter.stock = {
                $gt: 0,
            };
        }

        if (inStock === "false") {
            filter.stock = 0;
        }

        //validation
        if (minPrice !== undefined && isNaN(Number(minPrice))) {
            return res.status(400).json({
                success: false,
                message: "minPrice must be a valid number",
            });
        }

        if (maxPrice !== undefined && isNaN(Number(maxPrice))) {
            return res.status(400).json({
                success: false,
                message: "maxPrice must be a valid number",
            });
        }

        if (minRating !== undefined && isNaN(Number(minRating))) {
            return res.status(400).json({
                success: false,
                message: "minRating must be a valid number",
            });
        }

        //sorting 
        let sortOption = { createdAt: -1 };

        switch (sort) {
            case "price_asc":
                sortOption = { price: 1 };
                break;

            case "price_desc":
                sortOption = { price: -1 };
                break;

            case "rating_desc":
                sortOption = { rating: -1 };
                break;

            case "newest":
                sortOption = { createdAt: -1 };
                break;

            case "oldest":
                sortOption = { createdAt: 1 };
                break;

            case "name_asc":
                sortOption = { name: 1 };
                break;

            case "name_desc":
                sortOption = { name: -1 };
                break;

            default:
                sortOption = { createdAt: -1 };
        }

        const products = await Product.find(filter)
            .sort(sortOption);

        return res.status(200).json({
            success: true,
            count: products.length,
            filters: {
                category: category || null,
                brand: brand || null,
                minPrice: minPrice || null,
                maxPrice: maxPrice || null,
                minRating: minRating || null,
                inStock: inStock || null,
                sort: sort || "newest",
            },
            products,
        });

    } catch (error) {
        console.error("Filter products error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to filter products",
            error: error.message,
        });
    }
};

//Admin update product stock
export const updateStock = async(req, res)=>{
    try {
        const {productId} = req.params;
        const {stock} = req.body;
        
        if(!isValidObjectId(productId)){
            return res.status(400).json({
                success: false,
                message: "Invalid product id"
            })
        }

        //validate stock
        if(stock === undefined || !Number.isInteger(stock) || stock < 0){
            return res.status(400).json({
                success: false,
                message: "Stock must be a non-negative integer"
            })
        }

        const product = await Product.findById(productId)
        if(!product){
            return res.status(404).json({
                success: false,
                message: "Product not found"
            })
        }

        product.stock = stock;
        await product.save();

        res.status(200).json({
            success: true,
            message: "Product stock update successfully",
            product: {
                _id: product._id,
                name: product.name,
                stock: product.stock,
                isActive: product.isActive

            }
        })
    } catch (error) {
        console.error("Update product stock error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update product stock",
        });
    }

}

// Admin: Get low-stock products
export const getLowStockProducts = async (req, res) => {
    try {
        const threshold = Number(req.query.threshold ?? 10);

        if (!Number.isInteger(threshold) || threshold < 0) {
            return res.status(400).json({
                success: false,
                message: "Threshold must be a non-negative integer",
            });
        }

        const products = await Product.find({
            stock: { $lte: threshold },
        }).sort({ stock: 1 });

        return res.status(200).json({
            success: true,
            count: products.length,
            threshold,
            products,
        });
    } catch (error) {
        console.error("Get low-stock products error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch low-stock products",
        });
    }
};

// Admin: Get out-of-stock products
export const getOutOfStockProducts = async (req, res) => {
    try {
        const products = await Product.find({
            stock: 0,
        }).sort({ updatedAt: -1 });

        return res.status(200).json({
            success: true,
            count: products.length,
            products,
        });
    } catch (error) {
        console.error("Get out-of-stock products error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch out-of-stock products",
        });
    }
};