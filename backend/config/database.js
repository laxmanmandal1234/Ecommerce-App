const mongoose = require("mongoose");

const connectDatabase = function(){
    mongoose.connect(process.env.mongodb_connection_URL, {useNewUrlParser: true})
    .then((data) => {
    console.log(`Mongodb connected with server at ${data.connection.host}`);
    });
}

module.exports = connectDatabase;


