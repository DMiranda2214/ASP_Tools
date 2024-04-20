const columnModel = require('./column.model');
const procedureStatusModel = require('./procedure.status.model');

class dataModel {
    constructor({
        tablename= '',
        tableColumns = [columnModel],
        proceduresStatus = [procedureStatusModel]
    }){
        this.tablename = tablename,
        this.tableColumns = tableColumns,
        this.procedure = proceduresStatus
    }
}

module.exports = dataModel;