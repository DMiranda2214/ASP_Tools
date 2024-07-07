const express = require('express');
const cors = require('cors');
const router = require('../routers/router');


class serverModel {
    constructor(){
        this.app = express();
        this.port = 3080;
        this.routerPath = '/api/v1';
        this.middleares();
        this.routers();
    }

    middleares(){
        this.app.use(cors());
        this.app.use(express.json());
    }

    routers(){
        this.app.use(this.routerPath, router);
    }

    listen(){
        this.app.listen(this.port,() => {
            console.log('Servidor corriendo en el puerto ' + this.port);
        });
    }
}

module.exports = serverModel;