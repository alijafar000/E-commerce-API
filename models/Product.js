import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    discount: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    brand: {
        type: String,
        required: true,
        trim: true
    }, 
    stock: {
        type: Number,
        required: true,
        default: 0, 
        min: 0,
        validate: {
           validator: Number.isInteger,
           message: "Stock must be a non-negative integer",
    }
    },
     images: [
            {
                url: {
                    type: String,
                    required: true,
                },
                publicId: {
                    type: String,
                    required: true,
                },
            },
        ],
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    }, 
    numReviews: {
        type: Number,
        default: 0,
        min: 0
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {timestamps: true})

const Product = mongoose.model("Product", productSchema)
export default Product;