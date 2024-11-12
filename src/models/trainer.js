/** @format */

const mongoose = require("mongoose");

const trianerSchema = new mongoose.Schema(
  {
    stripeCustomerID: {
      type: String,
      require: true,
    },
    profileImage: {
      type: String,
      default:
        "https://t3.ftcdn.net/jpg/03/64/62/36/360_F_364623623_ERzQYfO4HHHyawYkJ16tREsizLyvcaeg.jpg",
    },
    Address: {
      type: String,
      default: null,
      require: true,
    },
    fullName: {
      type: String,
      require: true,
    },

    email: {
      type: String,
      require: true,
    },

    password: {
      type: String,
      require: true,
    },

    gender: {
      type: String,
    },
    resetPasswordVerificationCode: {
      type: String,
      default: null,
    },

    resetcodeExpiry: {
      type: Date,
      default: null,
    },
    Dob: {
      type: String,
    },

    weight: {
      type: String,
    },

    height: {
      type: String,
    },
    token: {
      type: String,
      default: null,
    },
    Bio: {
      type: String,
      default: null,
    },
    Speciality: {
      type: Array,
      default: [],
    },
    Hourlyrate: {
      type: String,
      default: null,
    },
    Availiblity: {
      type: Array,
      default: [],
    },
    followers: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },
    Rating: {
      type: String,
      default: null,
    },
    Age: {
      type: String,
      default: null,
    },
    Experience: {
      type: String,
      default: null,
    },

    Reviews: {
      type: String,
      default: null,
    },
    isType: {
      type: String,
      default: "trainer",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    deviceToken: {
      // Add this field
      type: String,
      default: null,
    },
    trainerUploads: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("trainer", trianerSchema);
