/** @format */

const express = require("express");
const rootrouter = express.Router();

// getAll is for fectching all Users and Trainers
const user = require("./User_Routes/user.route");
const trainer = require("./Trainer_Routes/trainer.route");
const common = require("./Common_Routes/Common.route");
const getAll = require("./All_Users&Trainer_Routes/All_U&T_Routes");
const chat = require("./Chat_Routes/Chat_Routes");
const message = require("./Messages_Routes/Messages_Routes");

rootrouter.use("/user", user);
rootrouter.use("/trainer", trainer);
rootrouter.use("/common", common);
rootrouter.use("/", getAll);
rootrouter.use("/", chat);
rootrouter.use("/", message);

module.exports = rootrouter;
