const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = mongoose.model('User');
// Define collection and schema
let Datlich1080 = new Schema(
  {
    id: { type: String },
    status: { type: String },
    am: { type: User.schema },
    comTaxCode: { type: String },
    comName: { type: String },
    registrationDate: { type: Date },
    cancelDate: { type: Date },
    remark: { type: String },
  },
  {
    collection: 'datlich1080',
  }
);
module.exports = mongoose.model('datlich1080', Datlich1080);
