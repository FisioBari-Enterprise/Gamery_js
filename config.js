const dotenv = require('dotenv');

//Configura le env variables
dotenv.config();

module.exports = {
    MongoDBUser: process.env.MONGODB_USER,
    MongoDBPassword: process.env.MONGODB_PASSWORD,
    Port: process.env.PORT,
    TokenSecret: process.env.TOKEN_SECRET,
    MaxWordForRound: parseInt(process.env.MAX_WORD_FOR_ROUND)
};
