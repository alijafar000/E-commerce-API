import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    rating:{
        type: Number,
        min: 1,
        max: 5,
        required: true,
        validate: {
            validator: Number.isInteger,
            message: "Rating must be an integer between 1 and 5"
        }
    },

    comment:{
        type: String,
        required: true,
        minlength: 3,
        maxlength: 1000,
        trim: true
    }
}, {timestamps: true})

// One review per user for each product
reviewSchema.index(
    { product: 1, user: 1 },
    { unique: true }
);

const Review = mongoose.model("Review", reviewSchema)

export default Review;