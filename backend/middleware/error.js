const ErrorHandler = require("../utils/errorHandler.js");

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";

    //Wrong Mongodb ID Error, also called CastError
    if(err.name === "CastError"){
        const message = `Resource not found, Invalid ${err.path}`;
        err = new ErrorHandler(message, 400);
    }

    //MongoBD Duplicate Key Error
    if(err.code === 11000){
        const message = `Duplicate ${Object.keys(err.keyValue)} Entered`;
        err = new ErrorHandler(message, 400);
    }

    //Wrong JWT Error
    if(err.name === "JsonWebTokenError"){
        const message = `Json Web Token is Invalid. Try again`;
        err = new ErrorHandler(message, 400);
    }

    //JWT Expire Error
    if(err.name === "TokenExpiedError"){
        const message = `Json Web Token is Expired. Try again`;
        err = new ErrorHandler(message, 400);
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.message
    });
};
