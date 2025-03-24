const queryLoadTables = "SELECT TABLE_NAME, TABLE_TYPE FROM information_schema.tables WHERE table_schema = 'public'";

function queryInfoProcedure( tableName ){
    return `SELECT routine_name,routine_definition 
            FROM information_schema.routines 
            WHERE routine_type = 'FUNCTION' AND routine_name LIKE '${tableName}%'`;

}

function queryValidateIfProcedureExist(procedureName){
    return `SELECT EXISTS (
                SELECT 1 
                FROM information_schema.routines 
                WHERE routine_schema = 'public'
                AND routine_name = '${procedureName}'
            ) AS exists;`;
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
        * Author: ASPTools
        * Create date: ${now}
        * Description: Procedimiento para la creación de registros 
        *              en la tabla ${tableName}
        * ProcedureName: ${procedureName}
        * ASPTools:
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
            WHERE ${primaryKey} = ${primaryParam};
        END;
        \$\$
        LANGUAGE plpgsql;
    `
}

function queryCreateDeleteProcedure(procedureName,tableName,primaryKey,columns,infoColumns){
    const now = new Date();
    return `
        CREATE OR REPLACE FUNCTION ${procedureName}(IDRegistro INT)
        RETURNS VOID AS \$\$
        /*
        * Author: dbTools
        * Create date: ${now}
        * Description: Procedimiento para la eliminación de registros 
        *              en la tabla ${tableName}
        * ProcedureName: ${procedureName}
        * dbToolsInfo:
        
        ${infoColumns}
        */
        BEGIN
            DELETE FROM ${tableName} WHERE ${primaryKey} = IDRegistro;
        END;
        \$\$ LANGUAGE plpgsql;
    `;
}

function queryCreateGetAllProcedure(procedureName,tableName,primaryKey,getAllColumns,infoColumns,getAllValues){
    const now = new Date();
    return `
        CREATE OR REPLACE FUNCTION ${procedureName}()
        RETURNS TABLE(${getAllValues}) AS \$\$
        /*
        * Author: dbTools
        * Create date: ${now}
        * Description: Procedimiento para la consulta de registros
        *              en la tabla ${tableName}
        * ProcedureName: ${procedureName}
        * dbToolsInfo:
        
        ${infoColumns}
        */
        BEGIN
            RETURN QUERY
            SELECT ${getAllColumns}
            FROM ${tableName}
            ORDER BY ${primaryKey};
        END;
        \$\$
        LANGUAGE plpgsql;
    `;
}

function queryCreateGetXIdProcedure(procedureName,tableName,primaryKey,getAllColumns,infoColumns,getAllValues){
    const now = new Date();
    return `
        CREATE OR REPLACE FUNCTION ${procedureName}(IDRegistro UUID)
        RETURNS TABLE(${getAllValues}) AS \$\$
        /*
        * Author: dbTools
        * Create date: ${now}
        * Description: Procedimiento para la consulta de registros por ID
        *              en la tabla ${tableName}
        * ProcedureName: ${procedureName}
        * dbToolsInfo:
        
        ${infoColumns}
        */
        BEGIN
            RETURN QUERY
            SELECT ${getAllColumns}
            FROM ${tableName}
            WHERE ${primaryKey} = IDRegistro;
        END;
        \$\$
        LANGUAGE plpgsql;
    `;
}




module.exports = {
    queryLoadTables,
    queryInfoProcedure,
    queryValidateIfProcedureExist,
    queryGetColumnData,
    queryGetPrimaryKey,
    queryCreateInsertProcedure,
    queryCreateUpdateProcedure,
    queryCreateDeleteProcedure,
    queryCreateGetAllProcedure,
    queryCreateGetXIdProcedure,
}