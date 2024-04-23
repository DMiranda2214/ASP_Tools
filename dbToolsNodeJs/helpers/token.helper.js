const { configJwt } = require('../config/config');
const jwt = require('jsonwebtoken');


class tokenHelper {

    generateToken(username,password,database,urlServer,portServer){
        const payload = {
            username,
            password,
            database,
            urlServer,
            portServer
        }
        const token = jwt.sign(payload,configJwt.jwtSecret);
        return token;
    }
}

module.exports = tokenHelper;