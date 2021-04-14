const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define collection and schema
let School = new Schema({
  id: { type: String },
  idvnedu: { type: String },
  id_vnedu: { type: String },
  id_moet: { type: String },
  unit: {
    _id: { type: String },
    unitCode: { type: String },
    unitName: { type: String },
    status: { type: Boolean },
    createdAt: { type: Date }
  },
  schoolName: { type: String },
  schoolTaxCode: { type: String },
  status: { type: String },
  modules: {
    moduleName: { type: String },
    schoolYear: { type: String },
    amountSLL: { type: Number },
    income: { type: Number },
    fromDate_toDate: { type: Object },
    am: {
      _id: { type: String },
      userCode: { type: String },
      unitCode: { type: String },
      userName: { type: String },
      status: { type: Boolean },
      createdAt: { type: Date }
    },
    remark: { type: String },
  },
  remark: { type: String }
}, {
  collection: 'edu-ecosystems'
})

module.exports = mongoose.model('School', School)