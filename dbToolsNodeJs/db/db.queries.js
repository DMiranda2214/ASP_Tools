const queryLoadTables = "SELECT TABLE_NAME, TABLE_TYPE FROM information_schema.tables WHERE table_schema = 'public'";

function queryInfoProcedure( tableName ){
    return `SELECT routine_name,routine_definition FROM information_schema.routines WHERE routine_type = 'FUNCTION' AND routine_name LIKE '${tableName}%'`;

}

function queryGetColumnData(tableName){
    return `SELECT COLUMN_NAME,DATA_TYPE,CHARACTER_MAXIMUM_LENGTH FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${tableName}' ORDER BY ORDINAL_POSITION`;
}


module.exports = {
    queryLoadTables,
    queryInfoProcedure,
    queryGetColumnData
}