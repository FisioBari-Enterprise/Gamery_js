const dotenv = require('dotenv');

//Configura le env variables
dotenv.config();

module.exports = {
    Host: process.env.HOST,
    Port: process.env.PORT,
    MongoDBUser: process.env.MONGODB_USER,
    MongoDBPassword: process.env.MONGODB_PASSWORD,
    TokenSecret: process.env.TOKEN_SECRET,
    TokenEmail: process.env.TOKEN_EMAIL,
    Database: process.env.DATABASE,
    IdEmail: process.env.EMAIL_ID,
    PasswordEMail: process.env.EMAIL_PASSWORD
};
