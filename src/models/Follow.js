const { default: mongoose } = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const Follow = new mongoose.Schema({
  userName: { type: String, required: true, unique: true },
  role: { type: String, enum: ["user", "trainer"], required: true },
  followers: [{ type: ObjectId, ref: "user" }],
  following: [{ type: ObjectId, ref: "trainer" }],
});
module.exports = mongoose.model("follow", Follow);
