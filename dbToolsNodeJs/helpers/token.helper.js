const { configJwt } = require('../config/config');
const jwt = require('jsonwebtoken');


class tokenHelper {

    generateToken(server,port,dataBase,username,password){
        const payload = {
            username,
            password,
            dataBase,
            server,
            port
        }
        const token = jwt.sign(payload,configJwt.jwtSecret);
        return token;
    }
}

module.exports = tokenHelper;