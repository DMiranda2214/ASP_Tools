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

const pgLoadInfoTables = async(req,res = response) => {
    try {
        const {username,password,database,urlServer,portServer} = req.body;
        const client = await pgClientHelper.pgDataConnection(username,password,database,urlServer,portServer);
        const tables = await pgClientHelper.pgLoadInfoTables(client);
        res.status(200).json(tables);
    } catch (error) {
        res.status(404).json({message:'Error al cargar las tablas'});
    }
}

const pgCreateProcedureInsert = async(req,res = response) => {
    try {
        const {username,password,database,urlServer,portServer,tableName} = req.body;
        const client = await pgClientHelper.pgDataConnection(username,password,database,urlServer,portServer);
        await pgClientHelper.pgCreateProcedureInsert(client,tableName);
        res.status(201).json({message:'Procedimiento almacenado insertar, creado con exito'});
    } catch (error) {
        res.status(404).json({message:'Error al crear el procedimiento almacenado crear'});
    }
}

const pgCreateProcedureUpdate = async(req,res = response) => {
    try {
        const {username,password,database,urlServer,portServer,tableName} = req.body;
        const client = await pgClientHelper.pgDataConnection(username,password,database,urlServer,portServer);
        await pgClientHelper.pgCreateProcedureUpdate(client,tableName);
        res.status(201).json({message:'Procedimiento almacenado actualizar, creado con exito'});
    } catch (error) {
        res.status(404).json({message:'Error al crear el procedimiento almacenado crear'});
    }
}


module.exports = {
    pgConnection,
    pgLoadInfoTables,
    pgCreateProcedureInsert,
    pgCreateProcedureUpdate,
}