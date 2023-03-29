const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const User = require("../models/userModel.js");
const jwt = require("jsonwebtoken");


exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
    const {token} = req.cookies;
    if(!token){
        return next(new ErrorHandler("Please login to use this resource", 401));
    }
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);      //thisdecoded token contains id of the user
    
    //finding user and storing inside req object as req.user
    req.user = await User.findById(decodedData.id);     //this id is the id of the user we passed during jwt signing, jwt.sign({id: this._id})

    next();
});

exports.authorizeRoles = (currentUserRole) => {    //stores "admin" passed in this currentUserRole variable
    return (req, res, next) => {
        if(currentUserRole !== req.user.role){     //if not admin
            return next(new ErrorHandler(`Role: ${req.user.role} is not authorized to access this resource`, 403));
        }

        next();
    }
}
