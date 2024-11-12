const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const messageSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      require: true,
    },

    user: {
      // _id: false,
      type: {
        type: String,
        enum: ["user", "trainer"],
        required: true,
      },
      _id: {
        type: ObjectId,
        required: true,
        refPath: "user.type",
      },
    },
    // senderId: {
    //   type: ObjectId,
    //   ref: "user" && "trainer",
    // },
    chatId: {
      type: ObjectId,
      ref: "Chat",
      require: true,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Message", messageSchema);
