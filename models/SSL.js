const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = mongoose.model('User');
// Define collection and schema
let SSL = new Schema(
  {
    id: { type: String },
    status: { type: String },
    bundle: { type: String },
    domain: { type: String },
    am: { type: User.schema },
    comTaxCode: { type: String },
    comName: { type: String },
    registrationDate: { type: Date },
    expirationDate: { type: Date },
    incomeDate: { type: Date },
    income: { type: Number },
    extend: [{
      _id: { type: String },
      numberOfExtend: { type: String },
      fromDate: { type: Date },
      toDate: { type: Date },
      incomeDate: { type: Date },
      income: { type: Number },
      remark: { type: String },
      am: { type: User.schema },
    }],
    cancelDate: {
      type: Date,
    },
    remark: {
      type: String,
    },
    typeOfCustomer: { type: String },
    detailTypeOfCustomer: { type: String },
  },
  {
    collection: 'ssl',
  }
);

module.exports = mongoose.model('SSL', SSL);
