const app = require("./app.js");
const dotenv = require("dotenv");
const connectDatabase = require("./config/database.js");
const cloudinary = require("cloudinary");


//Handling Uncaught Exceptions
//this type of error should be handled at the start
process.on("uncaughtException", (err) => {
    console.log(`Error: ${err.message}`);
    console.log("Shutting down the server due to Uncaught Exception");
    process.exit(1);
})

//Config

dotenv.config({path: "backend/config/config.env"});

//connecting to database

connectDatabase();

cloudinary.config({
    cloud_name: process.env.CLOUDINAY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

//listening to server, also storing it in a variavle in case we need to close the server

const server = app.listen(process.env.PORT, () => {
    console.log(`Server is running on port http://localhost:${process.env.PORT}/`);
});


//Unhandled Promise Rejections
//this type of error should be handled at the end, and you must close the 
//server as soon as possible and exit the process.

process.on("unhandledRejection", (err) => {
    console.log(`Error: ${err.message}`);
    console.log("Shutting down the server due to unhandled promise rejection.");

    server.close(() => {   
        process.exit(1);
    });
});