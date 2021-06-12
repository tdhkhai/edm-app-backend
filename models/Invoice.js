const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = mongoose.model('User');

// Define collection and schema
let Invoice = new Schema(
  {
    id: { type: String },
    status: { type: String },
    monthAction: { type: Date },
    // am: { type: Schema.Types.ObjectId, ref: 'User' },
    am: { type: User.schema },
    comTaxCode: { type: String },
    comName: { type: String },
    dateDemo: { type: Date },
    dateGolive: { type: Date },
    dateExtend: { type: Date },
    dateDelete: { type: Date },
    amount: { type: Number },
    income: { type: Number },
    incomeDate: { type: Date },
    typeOfIncome: { type: String },
    typeOfCustomer: { type: String },
    detailTypeOfCustomer: { type: String },
  },
  {
    collection: 'invoices',
  }
);

module.exports = mongoose.model('Invoice', Invoice);
