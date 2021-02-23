const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define collection and schema
let Invoice = new Schema({
    id: {
        type: String
    },
    status: {
        type: String
    },
    monthAction:{
        type: Date
    },
    am: {
        _id: String,
        userCode: String,
        unitCode: String,
        userName: String,
    },
    comTaxCode:{
        type: String
    },
    comName:{
        type: String
    },
    dateDemo:{
        type: Date
    },
    dateGolive:{
        type: Date
    },
    dateExtend:{
        type: Date
    },
    dateDelete:{
        type: Date
    },
    amount:{
        type: Number
    },
    income:{
        type: Number
    },
    incomeDate:{
        type: Date
    },
    typeOfIncome:{
        type: String
    }
}, {
    collection: 'invoices'
})

module.exports = mongoose.model('Invoice', Invoice)