const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    stripeCustomerID: {
      type: String,
      require: true,
    },
    profileImage: {
      type: String,
      default: null,
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
    Address: {
      type: String,
      require: true,
    },
    resetPasswordVerificationCode: {
      type: String,
      default: null,
    },

    resetcodeExpiry: {
      type: Date,
      default: null,
    },

    gender: {
      type: String,
      default: null,
    },

    Dob: {
      type: String,
      default: null,
    },

    weight: {
      type: Number,
      default: null,
    },

    height: {
      type: Number,
      default: null,
    },
    isType: {
      type: String,
      default: "user",
    },
    token: {
      type: String,
      default: null,
    },
    followedTrainers: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },
    favoriteTrainers: {
      type: Array,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("user", userSchema);
