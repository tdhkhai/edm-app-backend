const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define collection and schema
let TypeOfService = new Schema({
    id: {
        type: String
    },
    typeOfServiceCode: {
        type: String
    },
    typeOfServiceName: {
        type: String
    },
    status: {
        type: Boolean
    },
    createdAt: {
        type: Date
    }
}, {
    collection: 'typeofservices'
})

module.exports = mongoose.model('TypeOfService', TypeOfService)