class columnModel{
    constructor({
        name = '',
        type = '',
        size = 0
    }){
        this.name= name,
        this.type = type,
        this.size = size
    }
}

module.exports = columnModel;