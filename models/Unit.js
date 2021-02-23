const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define collection and schema
let Unit = new Schema({
    id: {
        type: String
    },
    unitCode: {
        type: String
    },
    unitName: {
        type: String
    },
    status: {
        type: Boolean
    },
    createdAt: {
        type: Date
    }
}, {
    collection: 'units'
})

module.exports = mongoose.model('Unit', Unit)