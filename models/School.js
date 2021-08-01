const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = mongoose.model('User');
const Unit = mongoose.model('Unit');
// Define collection and schema
let School = new Schema(
  {
    id: { type: String },
    id_vnedu: { type: String },
    id_moet: { type: String },
    typeOfSchool: { type: String },
    unit: { type: Unit.schema },
    schoolName: { type: String },
    schoolTaxCode: { type: String },
    caphoc: { type: String },
    status: { type: String },
    modules: {
      loaiHD_SLL: { type: String },
      moduleName: { type: String },
      schoolYear: { type: String },
      amountSLL: { type: Number },
      income: { type: Number },
      incomeDate: { type: Date },
      fromDate_toDate: { type: Object },
      thoihanhopdong: { type: String },
      am: { type: User.schema },
      status: { type: String },
      remark: { type: String },
    },
    remark: { type: String },
  },
  {
    collection: 'edu-ecosystems',
  }
);

module.exports = mongoose.model('School', School);
