const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define collection and schema
let Xinxe = new Schema({
  id: { type: String },
  noidi: { type: String },
  noiden: { type: String },
  noidung: { type: String },
  km_di: { type: Number },
  km_ve: { type: Number },
  so_km: { type: Number },
  so_lit: { type: Number },
  ngaydi_ve: { type: Array },
}, {
  collection: 'xinxe'
})

module.exports = mongoose.model('Xinxe', Xinxe)
