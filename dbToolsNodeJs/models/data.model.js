const columnModel = require('./column.model');

class dataModel {
    constructor({
        tablename= '',
        tableColumns = [columnModel],
    }){
        this.tablename = tablename,
        this.tableColumns = tableColumns,
        this.procedureStatus = [
            {
                name:'crear',
                state:false
            },
            {
                name:'actualizar',
                state:false
            },
            {
                name:'eliminar',
                state:false
            },
            {
                name:'obtenertodos',
                state:false
            },
            {
                name:'obtenerid',
                state:false
            }
        ]
    }
}

module.exports = dataModel;