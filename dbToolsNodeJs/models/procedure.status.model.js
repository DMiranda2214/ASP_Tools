class procedureStatusModel{
    constructor({
        name = '',
        state = false,
    }){
        this.name = name,
        this.state = state
    }
}

module.exports = procedureStatusModel;