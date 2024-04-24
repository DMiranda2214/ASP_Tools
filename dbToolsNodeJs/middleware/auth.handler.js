const boom = require('@hapi/boom');
const jwt = require('jsonwebtoken');
const { configJwt } = require('../config/config');

function verifyToken(req,res,next){
    try {
        const sessionToken = req.headers.authorization.replace('Bearer','').trim();
        const payload = jwt.verify(sessionToken,configJwt.jwtSecret);
        req.dataConnection = payload;
        next();       
    } catch (error) {
        throw boom.unauthorized('Token invalido')
    }
}

module.exports = {
    verifyToken,
}