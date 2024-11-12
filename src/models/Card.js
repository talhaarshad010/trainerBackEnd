/** @format */

const mongoose = require('mongoose');

const CardSchema = mongoose.Schema({
  CardholderName: {
    type: String,
    require: true,
  },
  UserID: {
    type: String,
    require: true,
  },
  CardNumber: {
    type: String,
    require: true,
  },
  CVV: {
    type: Number,
    require: true,
  },
  ExpirationDate: {
    type: String,
    require: true,
  },
  CardType: {
    type: String,
  },
});

module.exports = mongoose.model('Card-details', CardSchema);
