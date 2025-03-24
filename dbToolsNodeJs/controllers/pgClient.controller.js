const { response } = require('express');
const boom = require('@hapi/boom');
const PgClientHelper = require('../helpers/pgClient.helper');
const TokenHelper = require('../helpers/token.helper');
const pgClientHelper = new PgClientHelper();
const tokenHelper = new TokenHelper()

const pgConnection = async (req,res = response) => {
    try {
        const {
            server,
            port,
            dataBase,
            username,
            password,
        } = req.body;
        const client = await pgClientHelper.pgDataConnection(server,port,dataBase,username,password); 
        await pgClientHelper.pgConnection(client)
        if (client._connected) {
            await pgClientHelper.pgDisconnect(client);
            sessionToken = tokenHelper.generateToken(server,port,dataBase,username,password);
            res.json({message: 'Conexion establecida con exito', sessionToken: sessionToken});
        } else {
            res.status(404).json({message:'Credenciales incorrectassss'});
        }
    } catch (error) {
        res.status(404).json({message:'Credenciales incorrectas'});
    }
}

const pgLoadInfoTables = async(req,res = response) => {
    try {
        const {port,dataBase,username,server,password} = req.dataConnection;
        const client = await pgClientHelper.pgDataConnection(server,port,dataBase,username,password);
        const tables = await pgClientHelper.pgLoadInfoTables(client);
        res.status(200).json(tables);
    } catch (error) {
        res.status(404).json({message:'Error al cargar las tablas'});
    }
}

const pgCreateAllProcedures = async(req,res = response) => {
    try {
        const {port,dataBase,username,server,password} = req.dataConnection;
        const {tableName} = req.body;
        const client = await pgClientHelper.pgDataConnection(server,port,dataBase,username,password);
        await pgClientHelper.pgCreateAllProcedures(client,tableName);
        res.status(201).json({message:'Procedimientos almacenados creados con exito'});
    } catch (error) {
        res.status(404).json({message:'Error al crear los procedimientos almacenados'});
    }
}

const pgCreateProcedureInsert = async(req,res = response) => {
    try {
        const {port,dataBase,username,server,password} = req.dataConnection;
        const {tableName} = req.body;
        const client = await pgClientHelper.pgDataConnection(server,port,dataBase,username,password);
        await pgClientHelper.pgCreateProcedureInsert(client,tableName);
        res.status(201).json({message:'Procedimiento almacenado insertar, creado con exito'});
    } catch (error) {
        res.status(404).json({message:'Error al crear el procedimiento almacenado crear'});
    }
}

const pgCreateProcedureUpdate = async(req,res = response) => {
    try {
        const {port,dataBase,username,server,password} = req.dataConnection;
        const {tableName} = req.body;
        const client = await pgClientHelper.pgDataConnection(server,port,dataBase,username,password);
        await pgClientHelper.pgCreateProcedureUpdate(client,tableName);
        res.status(201).json({message:'Procedimiento almacenado actualizar, creado con exito'});
    } catch (error) {
        res.status(404).json({message:'Error al crear el procedimiento almacenado actualizar'});
    }
}

const pgCreateProcedureDelete = async(req, res = response) => {
    try {
        try {
            const {port,dataBase,username,server,password} = req.dataConnection;
            const {tableName} = req.body;
            const client = await pgClientHelper.pgDataConnection(server,port,dataBase,username,password);
            await pgClientHelper.pgCreateProcedureDelete(client,tableName);
            res.status(201).json({message:'Procedimiento almacenado eliminar, creado con exito'});
        } catch (error) {
            res.status(404).json({message:'Error al crear el procedimiento almacenado eliminar'});
        }
    } catch (error) {
        
    }
}

const pgCreateProcedureGetAll = async(req, res = response) => {
    try {
        try {
            const {port,dataBase,username,server,password} = req.dataConnection;
            const {tableName} = req.body;
            const client = await pgClientHelper.pgDataConnection(server,port,dataBase,username,password);
            await pgClientHelper.pgCreateProcedureGetAll(client,tableName);
            res.status(201).json({message:'Procedimiento almacenado obtener todos, creado con exito'});
        } catch (error) {
            res.status(404).json({message:'Error al crear el procedimiento almacenado obtener todos'});
        }
    } catch (error) {
        
    }
}

const createProcedureGetXId = async(req, res = response) => {
    try {
        try {
            const {port,dataBase,username,server,password} = req.dataConnection;
            const {tableName} = req.body;
            const client = await pgClientHelper.pgDataConnection(server,port,dataBase,username,password);
            await pgClientHelper.pgCreateProcedureGetXId(client,tableName);
            res.status(201).json({message:'Procedimiento almacenado obtener por ID, creado con exito'});
        } catch (error) {
            res.status(404).json({message:'Error al crear el procedimiento almacenado obtener por ID'});
        }
    } catch (error) {
        
    }
}


module.exports = {
    pgConnection,
    pgLoadInfoTables,
    pgCreateAllProcedures,
    pgCreateProcedureInsert,
    pgCreateProcedureUpdate,
    pgCreateProcedureDelete,
    pgCreateProcedureGetAll,
    createProcedureGetXId,
}