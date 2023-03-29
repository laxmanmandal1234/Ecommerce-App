const express = require("express");
const errorMiddleware = require("./middleware/error.js");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");

//import All Routers here
const productRoute = require("./routes/productRoute.js");
const userRoute = require("./routes/userRoute.js");
const orderRoute = require("./routes/orderRoute.js");

const app = express();

//Middleware for errors
app.use(errorMiddleware);

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());

app.use("/api/v1", productRoute);        //using Product Router here
app.use("/api/v1", userRoute);           //using User Router here
app.use("/api/v1", orderRoute);           //using Order Router here

module.exports = app;