const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define collection and schema
let Service = new Schema({
    id: {
        type: String
    },
    serviceCode: {
        type: String
    },
    serviceName: {
        type: String
    },
    typeOfService: {
        type: Object
    },
    status: {
        type: Boolean
    },
    createdAt: {
        type: Date
    }
}, {
    collection: 'services'
})

module.exports = mongoose.model('Service', Service)