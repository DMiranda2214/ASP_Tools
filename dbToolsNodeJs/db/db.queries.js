const queryLoadTables = "SELECT TABLE_NAME, TABLE_TYPE FROM information_schema.tables WHERE table_schema = 'public'";

function queryInfoProcedure( tableName ){
    return `SELECT routine_name,routine_definition 
            FROM information_schema.routines 
            WHERE routine_type = 'FUNCTION' AND routine_name LIKE '${tableName}%'`;

}

function queryGetColumnData(tableName){
    return `SELECT COLUMN_NAME,DATA_TYPE,CHARACTER_MAXIMUM_LENGTH 
            FROM INFORMATION_SCHEMA.COLUMNS WHERE 
            TABLE_NAME = '${tableName}' 
            ORDER BY ORDINAL_POSITION`;
}

function queryGetPrimaryKey(tableName){
     return `SELECT kcu.column_name
            FROM information_schema.table_constraints tc
            LEFT JOIN information_schema.key_column_usage kcu 
            ON tc.constraint_catalog = kcu.constraint_catalog 
            AND tc.constraint_schema = kcu.constraint_schema 
            AND tc.constraint_name = kcu.constraint_name
            WHERE lower(tc.constraint_type)= 'primary key' AND tc.table_name = '${tableName}';`
}

function queryCreateInsertProcedure(procedureName,tableName,primaryKey,paramsColumns,infoColumns,selectColumns,insertValues){
    const primaryParam = `_${primaryKey}`;
    const now = new Date();

    return `
        CREATE OR REPLACE FUNCTION ${procedureName}(${paramsColumns})
        RETURNS uuid AS \$\$
        /*
        * Author: dbTools
        * Create date: ${now}
        * Description: Procedimiento para la creación de registros 
        *              en la tabla ${tableName}
        * ProcedureName: ${procedureName}
        * dbToolsInfo:
        ${infoColumns}
        */
        DECLARE
        ${primaryParam} integer;
        BEGIN
            INSERT INTO ${tableName}(${selectColumns})
            VALUES (${insertValues})
            RETURNING ${primaryKey} INTO ${primaryParam};
            RETURN ${primaryParam};
        END;
        \$\$
        LANGUAGE plpgsql;
    `
}

function queryCreateUpdateProcedure(procedureName,tableName,primaryKey,paramColumns,infoColumns,updateColumns){
    const primaryParam = `_${primaryKey}`;
    const now = new Date();
    return `
        CREATE OR REPLACE FUNCTION ${procedureName}(${paramColumns})
        RETURNS VOID AS \$\$
        /*
        * Author: dbTools
        * Create date: ${now}
        * Description: Procedimiento para la actualización de registros
        *              en la tabla ${tableName}
        * ProcedureName: ${procedureName}
        * dbToolsInfo:
        
        ${infoColumns}
        */
        BEGIN
            UPDATE ${tableName}
            SET ${updateColumns}
            WHERE ${primaryKey} = _${primaryKey};
        END;
        \$\$
        LANGUAGE plpgsql;
    `
}


module.exports = {
    queryLoadTables,
    queryInfoProcedure,
    queryGetColumnData,
    queryGetPrimaryKey,
    queryCreateInsertProcedure,
    queryCreateUpdateProcedure,
}