const { Client } = require('pg');
const { queryLoadTables, 
        queryInfoProcedure,
        queryValidateIfProcedureExist,
        queryGetColumnData, 
        queryGetPrimaryKey, 
        queryCreateInsertProcedure, 
        queryCreateUpdateProcedure, 
        queryCreateDeleteProcedure,
        queryCreateGetAllProcedure,
        queryCreateGetXIdProcedure,} = require('../db/db.queries');
const DataModel = require('../models/data.model');
const ColumnModel = require('../models/column.model');

class PgClientHelper {
    async pgDataConnection(server,port,dataBase,username,password){
        const client = new Client({
            user: username,
            password: password,
            database: dataBase,
            port: port,
            host: server
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
                dataModel.tableColumns = await this._getColumns(client,tableName);
                dataModel.procedureStatus = await this._ValidateStatusProcedures(client,dataModel);
                dataList.push({
                    tableName:dataModel.tablename,
                    procedureStatus: dataModel.procedureStatus}
                );
            }            
            return dataList;
        } catch (error) {
            console.error(error);
        }finally{
            await this.pgDisconnect(client);
        }
    }

    async pgCreateAllProcedures(client,tableName){
        try {
            await this.pgConnection(client);
            const getColumns = await this._getColumns(client,tableName);
            const { primaryKeyColumn , primaryKeyType } = await this._getPrimaryKey(client,tableName);
            const infoColumns = await this._buildColumnsInfo(getColumns);
            const textSpInsert = await this._buildStoreProcedureInsert(tableName,primaryKeyColumn,primaryKeyType,getColumns,infoColumns);
            const textSpUpdate = await this._buildStoreProcedureUpdate(tableName,primaryKeyColumn,getColumns,infoColumns);
            const textSpDelete = await this._buildStoreProcedureDelete(tableName,primaryKeyColumn,primaryKeyType,infoColumns);
            const textSpGetAll = await this._buildStoreProcedureGetAll(tableName,primaryKeyColumn,getColumns,infoColumns);
            const textSpGetXId = await this._buildStoreProcedureGetXId(tableName,primaryKeyColumn,primaryKeyType,getColumns,infoColumns);
            await client.query(textSpInsert);
            await client.query(textSpUpdate);
            await client.query(textSpDelete);
            await client.query(textSpGetAll);
            await client.query(textSpGetXId);        
            return;
        } catch (error) {
            console.error(error);
        }
        finally{
            await this.pgDisconnect(client);
        }
    }

    async pgCreateProcedureInsert(client,tableName){
        try {
            await this.pgConnection(client);
            const getColumns = await this._getColumns(client,tableName);
            const { primaryKeyColumn , primaryKeyType } = await this._getPrimaryKey(client,tableName);
            const infoColumns = await this._buildColumnsInfo(getColumns);
            const textSpInsert = await this._buildStoreProcedureInsert(tableName,primaryKeyColumn,primaryKeyType,getColumns,infoColumns);
            await client.query(textSpInsert);
            return;
        } catch (error) {
            console.error(error);
        }
        finally{
            await this.pgDisconnect(client);
        }
    }

    async pgCreateProcedureUpdate(client,tableName){
        try {
            await this.pgConnection(client);
            const getColumns = await this._getColumns(client,tableName);
            const { primaryKeyColumn } = await this._getPrimaryKey(client,tableName);
            const infoColumns = await this._buildColumnsInfo(getColumns);
            const textSpUpdate = await this._buildStoreProcedureUpdate(tableName,primaryKeyColumn,getColumns,infoColumns);
            await client.query(textSpUpdate);
            return;
        }
        catch (error) {
            throw new Error(error.message);
        }
        finally{
            await this.pgDisconnect(client);
        }
    }

    async pgCreateProcedureDelete(client,tableName){
        try {
            await this.pgConnection(client);
            const { primaryKeyColumn, primaryKeyType } = await this._getPrimaryKey(client,tableName);
            const getColumns = await this._getColumns(client,tableName);
            const infoColumns = await this._buildColumnsInfo(getColumns);
            const textSpDelete = await this._buildStoreProcedureDelete(tableName,primaryKeyColumn,primaryKeyType,infoColumns);
            await client.query(textSpDelete);
            return;
        } catch (error) {
            console.error(error);
        }
        finally{
            await this.pgDisconnect(client);
        }
    }

    async pgCreateProcedureGetAll(client,tableName){
        try {
            await this.pgConnection(client);
            const getColumns = await this._getColumns(client,tableName);
            const { primaryKeyColumn} = await this._getPrimaryKey(client,tableName);
            const infoColumns = await this._buildColumnsInfo(getColumns);
            const textSpGetAll = await this._buildStoreProcedureGetAll(tableName,primaryKeyColumn,getColumns,infoColumns);
            await client.query(textSpGetAll);
            return;
        } catch (error) {
            console.error(error);
        }
        finally{
            await this.pgDisconnect(client);
        }
    }

    async pgCreateProcedureGetXId(client,tableName){
        try {
            await this.pgConnection(client);
            const getColumns = await this._getColumns(client,tableName);
            const { primaryKeyColumn, primaryKeyType } = await this._getPrimaryKey(client,tableName);
            const infoColumns = await this._buildColumnsInfo(getColumns);
            const textSpGetXId = await this._buildStoreProcedureGetXId(tableName,primaryKeyColumn,primaryKeyType,getColumns,infoColumns);
            await client.query(textSpGetXId);
            return;
        } catch (error) {
            console.error(error);
        }
        finally{
            await this.pgDisconnect(client);
        }
    }

    async _getColumns(client,tableName){
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
        try {
            const res = await client.query(queryGetPrimaryKey(tableName));
            if (res.rows.length > 0) {
                const primaryKeyColumn = res.rows[0].column_name;
                const primaryKeyType = res.rows[0].data_type
                if (primaryKeyColumn && primaryKeyColumn !== '') {
                    return { primaryKeyColumn, primaryKeyType };
                } else {
                    throw new Error(`No se encontro el nombre de la llave primaria en la tabla ${tableName}`);
                }
            } else {
                throw new Error(`No se encontro la llave primaria de la tabla ${tableName}`);
            }
        } catch (error) {
            console.error(error);
        }
    }

    async _buildColumnsInfo(columns){
        let columnsInfo = '';
        for(const column of columns){
            columnsInfo += `/*APSToolCampo ${column.name} ASPToolCampo*/ \n`;
        }
        return columnsInfo;
    }

    async _ValidateStatusProcedures(client,dataModel){
        try {
            dataModel.procedureStatus[0].state = await this._ValidateProcedureInsert(dataModel,client);
            dataModel.procedureStatus[1].state = await this._ValidateProcedureUpdate(dataModel,client);
            dataModel.procedureStatus[2].state = await this._ValidateProcedureDelete(dataModel,client);
            dataModel.procedureStatus[3].state = await this._ValidateProcedureGetAll(dataModel,client);
            dataModel.procedureStatus[4].state = await this._ValidateProcedureGetXId(dataModel,client);
            return dataModel.procedureStatus;
        } catch (error) {
            console.error(error);
        }
    }

    async _ValidateProcedureInsert(dataModel,client){
        const procedureName = `${dataModel.tablename}_Crear`;
        const res = await client.query(queryValidateIfProcedureExist(procedureName.toLocaleLowerCase()));        
        return res.rows[0].exists;
    }

    async _ValidateProcedureUpdate(dataModel,client){
        const procedureName = `${dataModel.tablename}_Actualizar`;
        const res = await   client.query(queryValidateIfProcedureExist(procedureName.toLocaleLowerCase()));
        return res.rows[0].exists;
    }

    async _ValidateProcedureDelete(dataModel,client){
        const procedureName = `${dataModel.tablename}_Eliminar`;
        const res = await client.query(queryValidateIfProcedureExist(procedureName.toLocaleLowerCase()));
        return res.rows[0].exists;
    }

    async _ValidateProcedureGetAll(dataModel,client){
        const procedureName = `${dataModel.tablename}_ObtenerTodos`;
        const res = await client.query(queryValidateIfProcedureExist(procedureName.toLocaleLowerCase()));
        return res.rows[0].exists;
    }

    async _ValidateProcedureGetXId(dataModel,client){
        const procedureName = `${dataModel.tablename}_ObtenerXId`;
        const res = await client.query(queryValidateIfProcedureExist(procedureName.toLocaleLowerCase()));
        return res.rows[0].exists; 
    }

    async _buildStoreProcedureInsert(tableName,primaryKeyColumn,primaryKeyType,getColumns,infoColumns){
        try {
            const procedureName = `${tableName}_Crear`;
            const paramsColumns = this._buildParamsColumns(primaryKeyColumn,getColumns);
            const insertColumns = this._buildColumnsInsertProcedure(getColumns,false);
            const insertValues = this._getInsertValues(getColumns, primaryKeyColumn);
            const textSpInsert = queryCreateInsertProcedure(procedureName,tableName,primaryKeyColumn,primaryKeyType,paramsColumns,infoColumns,insertColumns,insertValues);
            return textSpInsert;
        } catch (error) {
            console.error(error);
        }
    }

    async _buildStoreProcedureUpdate(tableName,primaryKey,columns,infoColumns){
        try {
            const procedureName = `${tableName}_Actualizar`;
            const paramColumns = this._buildParamsColumns(primaryKey,columns);
            const updateColumns = this._buildColumnsUpdateProcedure(columns,primaryKey);
            const textSpUpdate = queryCreateUpdateProcedure(procedureName,tableName,primaryKey,paramColumns,infoColumns,updateColumns);
            return textSpUpdate;
        } catch (error) {
            console.error(error);
        }
    }

    async _buildStoreProcedureDelete(tableName,primaryKey,primaryKeyType,infoColumns){
        try {
            const procedureName = `${tableName}_Eliminar`;
            const textSpDelete = queryCreateDeleteProcedure(procedureName,tableName,primaryKey,primaryKeyType,infoColumns);
            return textSpDelete;
        } catch (error) {
            console.error(error);
        }
    }

    async _buildStoreProcedureGetAll(tableName,primaryKey,columns,infoColumns){
        try {
            const procedureName = `${tableName}_ObtenerTodos`
            const getAllValues = this._buildColumnsInsertProcedure(columns,true);
            const getAllColumns = this._buildColumnsInsertProcedure(columns,false);
            const textSpGetAll = queryCreateGetAllProcedure(procedureName,tableName,primaryKey,getAllColumns,infoColumns,getAllValues);
            return textSpGetAll;
        } catch (error) {
            console.error(error);
        }
    }

    async _buildStoreProcedureGetXId(tableName,primaryKey, primaryKeyType,columns,infoColumns){
        try {
            const procedureName = `${tableName}_ObtenerXId`;
            const getAllValues = this._buildColumnsInsertProcedure(columns,true);
            const getAllColumns = this._buildColumnsInsertProcedure(columns,false);
            const textSpGetXId = queryCreateGetXIdProcedure(procedureName,tableName,primaryKey,primaryKeyType,getAllColumns,infoColumns,getAllValues);
            return textSpGetXId;
        } catch (error) {
            console.error(error);
        }
    }

    _buildParamsColumns(primaryKey,columns){
        let paramColumns = '';
        for(const column of columns){
            if (column.name !== primaryKey) {
                if (paramColumns.length > 0) {
                    paramColumns += `,\n`
                }
                paramColumns += `_${column.name} ${this._getDbType(column.type,column.size)}`
            }
        }
        return paramColumns;
    }

    _getDbType(columnType, columnSize) {
        // Verificar los tipos de campo y retornar el tipo correspondiente en la base de datos
        if (
          columnType === 'varchar' ||
          columnType === 'nvarchar' ||
          columnType === 'char' ||
          columnType === 'nchar'
        ) {
          // Si el tamaño es -1, usar 'text', de lo contrario, construir el tipo con el tamaño
          if (columnSize === -1) {
            return 'text';
          } else {
            return `${columnType}(${columnSize})`;
          }
        } else if (columnType === 'varbinary') {
          // Si el tamaño es -1, usar 'bytea', de lo contrario, construir el tipo con el tamaño
          if (columnSize === -1) {
            return 'bytea';
          } else {
            return `${columnType}(${columnSize})`;
          }
        } else if (columnType === 'datetime2') {
          // Convertir 'datetime2' a 'timestamp'
          return 'timestamp';
        } else {
          // Si no coincide con ningún tipo, retornar tal cual
          return columnType;
        }
    }

    _getInsertValues(columns, primaryKey){
        let isFirst = true;
        let insertValues = '';

        for(const column of columns){
            if(!isFirst){
                insertValues += ',';
            }
            else{
                isFirst= false;
                if(column.name === primaryKey){
                    insertValues += 'DEFAULT';
                    continue;
                }
            }
            insertValues += `_${column.name}`
        }
        return insertValues;
    }

    _buildColumnsInsertProcedure(columns,specifyType) {
        let isFirst = true;
        const result = [];
        for (const column of columns) {
          // Comprueba si es el primer campo, si es así, no agrega una coma al principio.
          if (!isFirst) {
            result.push(',');
          } else {
            isFirst = false;
          }
          // Si specifyType es true, realiza conversiones de tipo.
          let columnType = column.type;
          if (specifyType) {
            if (columnType === 'character varying') {
              columnType = 'varchar';
            }
            result.push(`_${column.name} ${columnType}`);
          } else {
            result.push(`${column.name}`);
          }
        }
        return result.join('');
    }

    _buildColumnsUpdateProcedure(columns, primaryKey){
        let updateValues='';
        for(const column of columns){
            if(column.name !== primaryKey){
                updateValues += `${column.name} = _${column.name}`;
                if (column !== columns.at(-1)) {
                    updateValues += ',';
                }
                updateValues += '\n';
            }
        }
        return updateValues;
    }
}

module.exports = PgClientHelper;