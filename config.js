const dotenv = require('dotenv');

//Configura le env variables
dotenv.config();

module.exports = {
    MongoDBUser: process.env.MONGODB_USER,
    MongoDBPassword: process.env.MONGODB_PASSWORD,
    port: process.env.PORT
};
