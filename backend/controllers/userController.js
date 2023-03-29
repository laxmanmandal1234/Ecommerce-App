const ErrorHandler = require("../utils/errorHandler.js");
const catchAsyncErrors = require("../middleware/catchAsyncErrors.js");
const User = require("../models/userModel.js");
const Product = require("../models/productModel.js");
const sendToken = require("../utils/jwtToken.js");
const sendEmail = require("../utils/sendEmail.js");
const crypto = require("crypto");
const cloudinary = require("cloudinary");

//Register a user

exports.registerUser = catchAsyncErrors(async (req, res, next) => {
    
    const myCloud = await cloudinary.v2.uploader.upload(req.files.avatar.name, {
        folder: "avatars",
        width: 150,
        crop: "scale"
    });

    console.log(`File uploaded = ${req.files.avatar.name}`);

    const {name, email, password} = req.body;
    const user = await User.create({
        name: name,
        email: email,
        password: password,
        avatar: {
            public_id: myCloud.public_id,
            url: myCloud.secure_url
        }
    });

    // const token = user.getJWTToken();

    // res.status(201).json({
    //     success: true,
    //     message: "User registered successfully.",
    //     token
    // })
    //The above code is replaced with this below code

    sendToken(user, 201, res, "User registered successfully");

});

//Login User
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
    const {email, password} = req.body;

    //if email or password is empty
    if(!email || !password){
        return next(new ErrorHandler("Please enter Email and Password!", 400));
    }

    //checking if user exists
    const user = await User.findOne({email}).select("+password");

    if(!user){
        return next(new ErrorHandler("Invalid email or password"), 401);
    }

    const isPasswordMatched = await user.comparePassword(password);

    if(!isPasswordMatched){
        return next(new ErrorHandler("Invalid email or password"), 401);
    }
    
    // const token = user.getJWTToken();

    // res.status(200).json({
    //     success: true,
    //     message: "Logged In successfully.",
    //     token
    // });

    sendToken(user, 200, res, "Logged In successfully");
});

//Logout User
exports.logout = catchAsyncErrors(async (req, res, next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })

    res.status(200).json({
        success: true,
        message: "Logged Out"
    });
});

//Forgot Password
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const {email} = req.body;
    const user = await User.findOne({email});
    if(!user){
        return next(new ErrorHandler("No user found with the email", 404));
    }

    //Generate ResetPassword Token
    const resetToken = user.getResetPasswordToken();
    await user.save({ValidityBeforeSave: false});   //to save the resetPasswordToken and resetPasswordExpired field inthe User added during creating reset password token 
    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`;
    const message = `Your password reset token is : \n\n ${resetPasswordUrl} \n\n If you have not requested this email then, please ignore it. `;

    try {
        await sendEmail({           //sending this object to sendEmail() method
            email: user.email,
            subject: "Ecommerce Password Recovery",
            message: message
        });

        res.status(200).json({
            success: true,
             message: `Email sent to ${user.email} successfully.`
        });
        
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpired = undefined;
        await user.save({ValidityBeforeSave: false});
        
        return next(new ErrorHandler(error.message, 500));
    }
});

//Reset password
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
    //creating token hash because the token saved inside resetPasswordToken field is hashed one while the resetPasswordToken is unhashed
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpired: {$gt: Date.now()}
    });

    if(!user){
        return next(new ErrorHandler("Reset Password Token is invalid or has been expired", 400));
    }
    
    const {password, confirmPassword} = req.body;
    if(password !== confirmPassword){
        return next(new ErrorHandler("Password does not match", 400));
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpired = undefined;

    await user.save({ValidityBeforeSave: false});

    sendToken(user, 200, res, "Password changed successfully. \n\n You are now logged in.");

});

//Update Password
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
    
    const user = await User.findById(req.user._id).select("+password");      //we had earlier saved user details under req.user while authenticating user
    
    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);
    
    if(!isPasswordMatched){
        return next(new ErrorHandler("Old Password is incorrect!", 400));
    }
    
    if(req.body.newPassword !== req.body.confirmPassword){
        return next(new ErrorHandler("Passwords do not match!", 400));
    }

    user.password = req.body.newPassword;
    await user.save({ValidityBeforeSave: false});

    sendToken(user, 200, res, "Password Updated successfully.");

});

//Get User Details
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
    
    const user = req.user;      //we had earlier saved user details under req.user while authenticating user
    
    res.status(200).json({
        success: true,
        user
    });
});

//Update User Profile
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
    
    const newUserData = {
        name: req.body.name,
        email: req.body.email
    };

    //we will use Cloudinary here later

    const user = await User.findByIdAndUpdate(req.user._id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });      
    
    res.status(200).json({
        success: true,
        message: "Profile updated successfully."
    });
});

//Get All Users -- Admin
exports.getAllUsers = catchAsyncErrors(async (req, res, next) => {
    
    const users = await User.find();
    
    res.status(200).json({
        success: true,
        users
    });
});

//Get Single User Details -- Admin
exports.getSingleUserDetails = catchAsyncErrors(async (req, res, next) => {
    
    const user = await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHandler(`User does not exist with give id: ${req.params.findOne}`, 404));
    }
    
    res.status(200).json({
        success: true,
        user
    });
});

//Update User Role  --Admin
exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {
    
    const userData = {
        email: req.body.email,
        role: req.body.role
    };

    const user = await User.findByIdAndUpdate(req.params.id, userData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });      
    
    res.status(200).json({
        success: true,
        message: "User Role updated successfully."
    });
});

//Delete User -- Admin
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
    
    const user = await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHandler(`User does not exist with give id: ${req.params.id}`, 404));
    }
    
    await User.deleteOne({_id: req.params.id});

    res.status(200).json({
        success: true,
        message: `User with id: ${req.params.id} deleted successfully.`
    });
});



















//Creating a separate function for generating JWT token and send response

// const token = user.getJWTToken();

//     res.status(200).json({
//         success: true,
//         message: "Logged In successfully.",
//         token
//     });