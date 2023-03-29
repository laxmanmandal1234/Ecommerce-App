//Create Token and save in cookie

const sendToken = function(user, statusCode, res, message) {
    const token = user.getJWTToken();

    //options for cookie
    const options = {
        httpOnly: true,
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRE*24*60*60*1000),
    };

    res.status(statusCode).cookie("token", token, options).json({
        success: true,
        message: message,
        token,
        user,
    });
}

module.exports = sendToken;