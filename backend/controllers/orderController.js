const Product = require("../models/productModel.js");
const User = require("../models/userModel.js");
const Order = require("../models/orderModel.js");
const catchAsyncErrors = require("../middleware/catchAsyncErrors.js");
const ErrorHandler = require("../utils/errorHandler.js");

//CREATE A NEW ORDER
exports.createOrder = catchAsyncErrors(async (req, res, next) => {

    const {
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice
    } = req.body;

    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paidAt: Date.now(),
        user: req.user._id
    });

    res.status(201).json({
        success: true,
        order
    });
});

//GET A SINGLE ORDER DETAILS    --ADMIN
exports.getSingleOrderDetails = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate(
        "user",
        "name email"
    );
        //populate - instead of showing onlu user id avaliable in the "user" field of Order, it returns the name and email from users collection using user id
    if(!order){
        return next(new ErrorHandler(`Order with given id ${req.params.id} not found.`, 404));
    }

    res.status(200).json({
        success: true,
        order
    });
    
});

//GET LOGGED IN USER ORDER DETAILS
exports.getMyOrders = catchAsyncErrors(async (req, res, next) => {
    const orders = await Order.find({user: req.user._id});

    if(!orders){
        return next(new ErrorHandler(`Order with given id ${req.params.id} not found.`, 404));
    }

    res.status(200).json({
        success: true,
        orders
    });
});

//GET ALL ORDERS    --Admin
exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
    const orders = await Order.find().populate(
        "user",
        "name email"
    );

    if(!orders){
        return next(new ErrorHandler("No Orders Found", 404));
    }

    let total = 0;

    orders.forEach((order) => {
        total = total + order.totalPrice;
    });

    res.status(200).json({
        success: true,
        total,
        orders
    });
});

//UPDATE ORDER STATUS  --Admin
exports.updateOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.orderId).populate(
        "user",
        "name email"
    );

    if(!order){
        return next(new ErrorHandler(`No Order Found with this id ${req.params.orderId}`, 404));
    }

    if(order.orderStatus === "Delivered"){
        return next(new ErrorHandler(`This order is already Delivered`, 400));
    }

    if(req.body.status === "Shipped"){
        order.orderItems.forEach(async (item) => {
            updateStock(item.product, item.quantity)   //to update product Stock
        });
    }

    order.orderStatus = req.body.status;

    if(order.orderStatus === "Delivered"){
        order.deliveredAt = Date.now();
    }

    res.status(200).json({
        success: true
    });
});

async function updateStock(productId, quantity){
    const product = await Product.findById(productId);

    if(!product){
        return next(new ErrorHandler(`No Product Found with this id ${productId}`, 404));
    }

    product.stock -= quantity;
    await product.save({validateBeforeSave: false});
}

//DELETE ORDER  --Admin
exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.orderId).populate(
        "user",
        "name email"
    );

    if(!order){
        return next(new ErrorHandler(`No Order Found with this id ${req.params.orderId}`, 404));
    }

    await order.delete()
    res.status(200).json({
        success: true
    });
});