const { response } = require('express');
const boom = require('@hapi/boom');
const PgClientHelper = require('../helpers/pgClient.helper');
const pgClientHelper = new PgClientHelper();

const pgConnection = async (req,res = response) => {
    try {
        const {username,password,database,urlServer,portServer} = req.body;
        const client = await pgClientHelper.pgDataConnection(username,password,database,urlServer,portServer); 
        await pgClientHelper.pgConnection(client)
        if (client._connected) {
            await pgClientHelper.pgDisconnect(client);
            res.status(200).json({message: 'Conexion establecida con exito'});
        } else {
            res.status(404).json({message:'Credenciales incorrectas'});
        }
    } catch (error) {
        res.status(404).json({message:'Credenciales incorrectas'});
    }
}

const pgLoadTables = async(req,res = response) => {
    try {
        const {username,password,database,urlServer,portServer} = req.body;
        const client = await pgClientHelper.pgDataConnection(username,password,database,urlServer,portServer);
        const tables = await pgClientHelper.pgLoadTables(client);
        res.status(200).json(tables);
    } catch (error) {
        res.status(404).json({message:'Error al cargar las tablas'});
    }
}



module.exports = {
    pgConnection,
    pgLoadTables,
}