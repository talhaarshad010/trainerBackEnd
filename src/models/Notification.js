/** @format */

const mongoose = require('mongoose');

const NotificationSchema = mongoose.Schema({
  UserID: {
    type: String,
    require: true,
  },
  BookingTime: {
    type: String,
    require: true,
  },
  BookingDate: {
    type: String,
    require: true,
  },
});

module.exports = mongoose.model('Notification-reminders', NotificationSchema);
