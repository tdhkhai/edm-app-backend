const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Unit = mongoose.model('Unit');
// Define collection and schema
let User = new Schema(
  {
    id: { type: String },
    userCode: { type: String },
    unit: { type: Unit.schema },
    userName: { type: String },
    status: { type: Boolean },
    createdAt: { type: Date },
  },
  {
    collection: 'users',
  }
);

module.exports = mongoose.model('User', User);
