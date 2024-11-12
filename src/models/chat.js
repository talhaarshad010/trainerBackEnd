const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const chatSchema = new mongoose.Schema(
  {
    participants: [
      {
        _id: false,
        type: {
          type: String,
          enum: ["user", "trainer"],
          required: true,
        },
        userId: {
          type: ObjectId,
          required: true,
          refPath: "participants.type", // Dynamic reference based on type
        },
      },
    ],
    latestmessage: { type: Object },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", chatSchema);
