const { Client } = require('pg');
const { queryLoadTables, queryInfoProcedure, queryGetColumnData } = require('../db/db.queries');
const DataModel = require('../models/data.model');
const ColumnModel = require('../models/column.model');

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

    async pgLoadInfoTables(client){
        try {
            let dataList = []
            await this.pgConnection(client);
            const res = await client.query(queryLoadTables);
            for (const table of res.rows) {
                let dataModel = new DataModel({});
                const tableName = table.table_name;
                dataModel.tablename = tableName;
                dataModel.tableColumns = await this._GetColumns(client,tableName);
                dataModel.procedureStatus = await this._ValidateStatusProcedure(client,dataModel);
                dataList.push({
                    tableName:dataModel.tablename,
                    procedureStatus: dataModel.procedureStatus}
                );
            }
            console.log(dataList);
            return dataList;
        } catch (error) {
            console.error(error);
        }finally{
            await this.pgDisconnect(client);
        }
    }

    async pgCreateProcedureInsert(client,tableName){
        try {
            await this.pgConnection(client);
            const getColumns = await this._GetColumns(client,tableName);
            const getPrimaryKey = await this._getPrimaryKey(client,tableName);
            const infoColumns = await this._buildClumnsInfo(getColumns);
            
        } catch (error) {
            console.error(error);            
        }
        finally{
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

    async _getPrimaryKey(client,tableName){

    }

    async _buildClumnsInfo(columns){

    }

    async _ValidateStatusProcedure(client,dataModel){
        try {
            const res = await this._InfoProcedure(client,dataModel.tablename);
            if(res.rows < 1) return dataModel.procedureStatus;
            let procedureList = [];
            for(const infoProcedure of res.rows){
                const procedureName = infoProcedure.routine_name;
                const procedureContent = infoProcedure.routine_definition;
                const procedureState = await this._ValidateProcedure(dataModel,procedureName,procedureContent);
                procedureList = procedureState;
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
        const nameParams = procedureName.split('_');
        if(nameParams.length >= 1){
            const procedureType=nameParams.at(-1);
            switch (procedureType) {
                case 'crear':
                    dataModel.procedureStatus[0].state = await this._ParseColumns(dataModel,procedureContent);
                    break;
                case 'actualizar':
                    dataModel.procedureStatus[1].state = await this._ParseColumns(dataModel,procedureContent);
                    break;
                case 'eliminar':
                    dataModel.procedureStatus[2].state = await this._ParseColumns(dataModel,procedureContent);
                    break;
                case 'obtenerporid':
                    dataModel.procedureStatus[3].state = await this._ParseColumns(dataModel,procedureContent);
                    break;
                case 'obtener':
                    dataModel.procedureStatus[4].state = await this._ParseColumns(dataModel,procedureContent);
                    break;
                default:
                    return;
            }
            return dataModel.procedureStatus;
        }
        else{
            return dataModel.procedureStatus;
        }
    }

    async _ParseColumns (dataModel, procedureContent) {
        let result = [];
        // Expresión regular para buscar comentarios que indiquen los nombres de los campos.
        const fieldRegex = /\/\*dbToolCampo\s+(\w+)\s+dbToolCampo\*\//g;
        // Busca todas las coincidencias de la expresión regular en el contenido del procedimiento.
        let match;
        while ((match = fieldRegex.exec(procedureContent)) !== null) {
            result.push(match[1]);
        }

        if(dataModel.tableColumns.length > result.length){
            console.log('1');
            return false;
        }
        if(dataModel.tableColumns.length < result.length){
            console.log('2');
            return false;
        }
        for(const data of dataModel.tableColumns){
            if (!result.includes(data.name)) {
                console.log('3');
                return false;
            }
        }
        return true;
    }
}

module.exports = PgClientHelper;