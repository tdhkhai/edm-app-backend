const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define collection and schema
let User = new Schema({
    id: {
        type: String
    },
    userCode: {
        type: String
    },
    unitCode: {
        type: String
    },
    userName: {
        type: String
    },
    status: {
        type: Boolean
    },
    createdAt: {
        type: Date
    }
}, {
    collection: 'users'
})

module.exports = mongoose.model('User', User)