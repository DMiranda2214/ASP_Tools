require('dotenv').config();

const configJwt = {
    jwtSecret: process.env.JWT_SECRET,
}

module.exports = { 
    configJwt, 
};