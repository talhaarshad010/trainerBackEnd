/** @format */

const mongoose = require("mongoose");

const BookingSchema = mongoose.Schema({
  UserID: {
    type: String,
    require: true,
  },
  Amount: {
    type: Number,
    require: true,
  },
  Date: {
    type: String,
    require: true,
  },
  Reminder: {
    type: String,
    require: true,
  },
  isType: {
    type: String,
    default: "trainer",
  },
  trainerId: {
    type: String,
    default: null,
  },
  profileImage: {
    type: String,
    default: null,
  },
  trainerName: {
    type: String,
    default: null,
  },
  userName: {
    type: String,
    default: null,
  },
  bookingTime: {
    type: String,
    default: null,
  },
  Address: {
    type: String,
    default: null,
  },
  paymentIntentId: {
    type: String,
    default: null,
  },
  paymentStatus: {
    type: String,
    default: "pending",
  },
  notificationSent: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model("Trainer-Bookings", BookingSchema);
