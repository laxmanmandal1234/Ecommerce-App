const Product = require("../models/productModel.js");
const ErrorHandler = require("../utils/errorHandler.js");
const catchAsyncErrors = require("../middleware/catchAsyncErrors.js");
const ApiFeatures = require("../utils/apifeatures.js");
const mongoose = require("mongoose");


//defining all route methods here

//CREATE A PRODUCT --Admin

exports.createProduct = catchAsyncErrors(async (req, res, next) => {
    
    req.body.user = req.user.id;    //we were saving user info in req.user during user authentication, here we are just passing user id to variable req.body.user
    const newProduct = await Product.create(req.body);
    res.status(201).json({
        success: true,
        newProduct
    });
});

// GET ALL PRODUCTS

exports.getAllProducts = catchAsyncErrors(async (req, res, next) => {
    
    const resultPerPage = 4;
    const productsCount = await Product.countDocuments();
    
    const apiFeature = new ApiFeatures(Product.find(), req.query)
        .search()
        .filter()
    
    let products = await apiFeature.foundProducts;      //results are stored inside foundProducts property of ApiFeatures
    let filteredProductsCount = products.length;

    apiFeature.pagination(resultPerPage);

    //executing the same query again, so need to use clone()
    let allProducts = await apiFeature.foundProducts.clone();   
         
    res.status(200).json({
        success: true,
        allProducts,
        productsCount,
        resultPerPage,
        filteredProductsCount,
    });
});

//GET A PRODUCT DETAILS

exports.getProductDetails = catchAsyncErrors(async (req, res, next) => {
    let product = await Product.findById(req.params.id);

    if(!product){
        return next(new ErrorHandler("Product Not Found", 404));
    }

    res.status(200).json({
        success: true,
        product
    });
});

// UPDATE A PRODUCT

exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
    let product = await Product.findById(req.params.id);

    if(!product){
        return next(new ErrorHandler("Product Not Found", 404));
    }

    product = await Product.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
            new: true,
            runValidators: true,
            useFindAndModify: false
        }
    );

    res.status(200).json({
        success: true,
        product
    });
});

// DELETE A PRODUCT

exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
    let product = await Product.findById(req.params.id);

    if(!product){
        return next(new ErrorHandler("Product Not Found", 404));
    }

    await Product.deleteOne({id: req.params.id});

    res.status(200).json({
        success: true,
        message: "Product deleted successfully."
    });
});

// DELETE ALL PRODUCTS

exports.deleteAllProducts = catchAsyncErrors(async (req, res, next) => {
    await Product.deleteMany();

    res.status(200).json({
        success: true,
        message: "All Products deleted successfully."
    });
});

//CREATE A PRODUCT REVIEW
exports.createProductReview = catchAsyncErrors(async (req, res, next) => {
        
    const { rating, comment, productId } = req.body;
    
    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment,
    };
  
    const product = await Product.findById(productId);

    const isReviewed = product.reviews.find((item) => 
        item.user.toString() === req.user._id.toString()
    );
  
    if(isReviewed) {
        product.reviews.forEach((item) => {
            if(item.user.toString() === req.user._id.toString()){
                item.rating = rating;
                item.comment = comment;
            }
        });
    } else {
      product.reviews.push(review);
      product.numOfReviews = product.reviews.length;
    }
  
    let avg = 0;
  
    product.reviews.forEach((item) => {
        avg = avg + item.rating;
    });
  
    product.ratings = avg / product.reviews.length;
  
    await product.save({ validateBeforeSave: false });
  
    res.status(200).json({
        success: true,
    });
});

//GET ALL REVIEWS OF A PRODUCT
exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.query.productId);

    if(!product){
        return next(new ErrorHandler(`Product with given id ${req.query.productId} not found`, 404));
    }

    const reviews = product.reviews;

    res.status(200).json({
        success: true,
        reviews
    });

});

//DELETE A REVIEW OF A PRODUCT
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.query.productId);

    if(!product){
        return next(new ErrorHandler(`Product with given id ${req.query.productId} not found`, 404));
    }

    const reviews = product.reviews.filter((review) => {
        return review._id.toString() !== req.query.reviewId.toString();
    });

    let sum = 0;
    let ratings = 0;

    reviews.forEach((review) => {
        sum = sum + review.rating;
    });

    if(reviews.length === 0) {
        ratings = 0
    } else {
        ratings = sum / reviews.length;
    }
    
    const numOfReviews = reviews.length;

    await Product.findByIdAndUpdate(
        req.query.productId,
        {
            ratings,
            reviews,
            numOfReviews
        },
        {
            new: true,
            runValidators: true,
            useFindAndModify: false
        }
    );

    res.status(200).json({
        success: true,
    });

});

























// start

// //initial version

// exports.createProduct = async (req, res, next) => {
//     const product = await Product.create(req.body);

//     res.status(200).json({
//         success: true,
//         product
//     });
// };

// exports.getAllProducts = async (req, res, next) => {
//     const products = await Product.find();

//     res.status(200).json({
//         success: true,
//         products
//     });
// };

// //without using ErrorHandler class to send error
// exports.updateProduct = async (req, res, next) => {
//     let product = await Product.findById(req.params.id);

//     if(!product){
//         return res.status(404).json({
//             success: false,
//             message: "Product not found"
//         });
//     }

//     product = await Product.findByIdAndUpdate(
//         req.params.id,
//         req.body,
//         {
//             new: true,
//             runValidators: true,
//             useFindAndModify: false
//         }
//     );

//     res.status(200).json({
//         success: true,
//         product
//     });
// }

// //using ErrorHandler class to throw and show error
// exports.updateProduct = async (req, res, next) => {
//     let product = await Product.findById(req.params.id);

//     if(!product){
//         // return res.status(404).json({
//         //     success: false,
//         //     message: "Product not found"
//         // });

//         return next(new ErrorHandler("Product not found", 404));  //the above lines replaced with this
//     }

//     product = await Product.findByIdAndUpdate(
//         req.params.id,
//         req.body,
//         {
//             new: true,
//             runValidators: true,
//             useFindAndModify: false
//         }
//     );

//     res.status(200).json({
//         success: true,
//         product
//     });
// }

// //with Async functioin we should always use try catch block
// //instead of using try catch block for every function, we have defined it inside catchAsyncErrors.js
// //and wrapping evry new function inside it. For ex this updateProduct() function below.

// //exports.updateProduct = catchAsyncErrors(your function here);

// exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
//     let product = await Product.findById(req.params.id);

//     if(!product){
//         // return res.status(404).json({
//         //     success: false,
//         //     message: "Product not found"
//         // });

//         return next(new ErrorHandler("Product not found", 404));  //the above lines replaced with this
//     }

//     product = await Product.findByIdAndUpdate(
//         req.params.id,
//         req.body,
//         {
//             new: true,
//             runValidators: true,
//             useFindAndModify: false
//         }
//     );

//     res.status(200).json({
//         success: true,
//         product
//     });
// });


// end