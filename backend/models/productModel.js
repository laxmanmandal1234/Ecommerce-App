const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter product Name!"]
    },
    price: {
        type: Number,
        required: [true, "Please enter product Price!"],
        maxLength: [8, "Price cannot exceed 8 figures!"]
    },
    description:{
        type: String,
        required: [true, "Please enter product Description!"],
    },
    ratings: {
        type: Number,
        default: 0
    },
    stock: {
        type: Number,
        required: [true, "Please enter product Stock!"],
        maxLength: [4, "Stock cannot exceed 4 figures!"],
        default: 1
    },
    images: [
        {
            public_id: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            }
        }
    ],
    category: {
        type: String,
        required: [true, "Please enter product category"]
    },
    numOfReviews: {
        type: Number,
        default: 0,
    },
    reviews: [
        {   
            user: {
                type: mongoose.Schema.ObjectId,
                ref: "User",
                required: true
            },
            name: {
                type: String,
                required: true
            },
            rating: {
                type: Number,
                min: 0,
                max: 5,
                required: true
            },
            comment: {
                type: String,
                required: true
            }
        }
    ],
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;