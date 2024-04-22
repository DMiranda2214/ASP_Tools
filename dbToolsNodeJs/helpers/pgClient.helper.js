const { Client } = require('pg');
const { queryLoadTables, queryInfoProcedure, queryGetColumnData, queryGetPrimaryKey, queryCreateInsertProcedure } = require('../db/db.queries');
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
            const spCreate = await this._buildStoreProcedureInsert(client,tableName,getPrimaryKey,getColumns,infoColumns);
            return;
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
        try {
            const res = await client.query(queryGetPrimaryKey(tableName));
            if (res.rows.length > 0) {
                const primaryKeyColumn = res.rows[0].column_name;
                if (primaryKeyColumn && primaryKeyColumn !== '') {
                    return primaryKeyColumn;
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

    async _buildClumnsInfo(columns){
        let columnsInfo = '';
        for(const column of columns){
            columnsInfo += `/*dbToolCampo ${column.name} dbToolCampo*/ \n`;
        }
        return columnsInfo;
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

    async _buildStoreProcedureInsert(client,tableName,primaryKey,columns,infoColumns){
        try {
            const procedureName = `${tableName}_Crear`;
            const paramsColumns = this._buildParamsColumns(primaryKey,columns);
            const selectColumns = this._buildColumnsInsertProcedure(columns,false);
            const insertValues = this._getInsertValues(columns, primaryKey);
            const res = await client.query(queryCreateInsertProcedure(procedureName,tableName,primaryKey,paramsColumns,infoColumns,selectColumns,insertValues));
            return res;
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
}

module.exports = PgClientHelper;