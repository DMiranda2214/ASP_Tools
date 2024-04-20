const { Client } = require('pg');
const { queryLoadTables, queryInfoProcedure, queryGetColumnData } = require('../db/db.queries');
const DataModel = require('../models/data.model');
const ColumnModel = require('../models/column.model');
const ProcedureStatusModel = require('../models/procedure.status.model');

class PgClientHelper {
    async pgDataConnection(username,password,database,urlServer,portServer){
        const client = new Client({
            user: username,
            password: password,
            database: database,
            host: urlServer,
            port: portServer
        });
        return client; 
    }

    async pgConnection(client){
        try {
            return await client.connect()
        } catch (error) {
            console.error(error);
        }
    }

    async pgDisconnect(client){
        try {
            return await client.end();
        } catch (error) {
            console.error(error);
        }
    }

    async pgLoadTables(client){
        try {
            let dataList = []
            await this.pgConnection(client);
            const res = await client.query(queryLoadTables);
            for (const table of res.rows) {
                let dataModel = new DataModel({});
                const tableName = table.table_name;
                dataModel.tablename = tableName;
                dataModel.tableColumns = await this._GetColumns(client,tableName);
                dataModel.procedure = await this._ValidateStatusProcedure(client,dataModel);
                dataList.push(dataModel);
            }
            return dataList;
        } catch (error) {
            console.error(error);
        }finally{
            await this.pgDisconnect(client);
        }
    }

    async _GetColumns(client,tableName){
        try {
            let columnList = [];
            const res = await client.query(queryGetColumnData(tableName));
            for(const columnData of res.rows){
                let columnModel = new ColumnModel({});
                columnModel.name = columnData.column_name,
                columnModel.type = columnData.data_type,
                columnModel.size = columnData.character_maximum_length
                columnList.push(columnModel);
            }
            return columnList;
        } catch (error) {
            console.error(error);
        }

    }

    async _ValidateStatusProcedure(client,dataModel){
        try {
            let procedureList = []
            const res = await this._InfoProcedure(client,dataModel.tablename)
            for(const infoProcedure of res.rows){
                const procedureName = infoProcedure.routine_name;
                const procedureContent = infoProcedure.routine_definition;
                const procedureState = await this._ValidateProcedure(dataModel,procedureName,procedureContent);
                if(procedureState != undefined){
                    procedureList.push(procedureState);
                }
            }
            return procedureList;
        } catch (error) {
            console.error(error);
        }
    }


    async _InfoProcedure(client,tableName){
        try {
            const res = await client.query(queryInfoProcedure(tableName));
            return res;    
        } catch (error) {
            console.error(error);
        }
    }

    async _ValidateProcedure(dataModel, procedureName, procedureContent){
        let procedureStatusModel = new ProcedureStatusModel({});
        const nameParams = procedureName.split('_');
        if(nameParams.length >= 1){
            const procedureType=nameParams.at(-1);
            switch (procedureType) {
                case 'crear':
                    procedureStatusModel.name = 'crear';
                    procedureStatusModel.state = await this._ParseColumns(dataModel,procedureContent);
                    break;
                case 'actualizar':
                    procedureStatusModel.name = 'actualizar';
                    procedureStatusModel.state = await this._ParseColumns(dataModel,procedureContent);
                    break;
                case 'eliminar':
                    procedureStatusModel.name = 'eliminar';
                    procedureStatusModel.state = await this._ParseColumns(dataModel,procedureContent);
                    break;
                case 'obtenerporid':
                    procedureStatusModel.name = 'obtenerporid';
                    procedureStatusModel.state = await this._ParseColumns(dataModel,procedureContent);
                    break;
                case 'obtener':
                    procedureStatusModel.name = 'obtener';
                    procedureStatusModel.state = await this._ParseColumns(dataModel,procedureContent);
                    break;
                default:
                    return;
            }
            return procedureStatusModel;
        }
        else{
            return "Tipo de procedimiento no encontrado";
        }
    }

    async _ParseColumns (dataModel, procedureContent) {
        let result = [];
        // Expresión regular para buscar comentarios que indiquen los nombres de los campos.
        const fieldRegex = /\/\*CielToolCampo\s+(\w+)\s+CielToolCampo\*\//g;
        // Busca todas las coincidencias de la expresión regular en el contenido del procedimiento.
        let match;
        while ((match = fieldRegex.exec(procedureContent)) !== null) {
            result.push(match[1]);
        }

        if(dataModel.tableColumns.length > result.length){
            return false;
        }
        if(dataModel.tableColumns.length < result.length){
            return false;
        }
        for(ColumnModel in dataModel.tableColumns ){
            if (!result.includes(ColumnModel.name)) {
                return false;
            }
        }

        return true;
    }
}

module.exports = PgClientHelper;