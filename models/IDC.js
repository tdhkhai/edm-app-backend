const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define collection and schema
let IDC = new Schema({
    id: {
        type: String
    },
    status: String,
    loaiIDC: {
        type: String
    },
    am: {
        _id: String,
        userCode: String,
        unitCode: String,
        userName: String,
    },
    comTaxCode: {
        type: String
    },
    comName: {
        type: String
    },
    registrationDate: {
        type: Date
    },
    expirationDate: Date,
    incomeDate: Date,
    income: Number,
    bundle: String,
    extend: {
        _id: String,
        numberOfExtend: String,
        fromDate: Date,
        toDate: Date,
        incomeDate: Date,
        income: Number,
        remark: String
    },
    cancelDate: {
        type: Date
    },
    remark: {
        type: String
    },
}, {
    collection: 'idc'
})

module.exports = mongoose.model('IDC', IDC)