const express = require("express");
const Chat_Controller = require("../Chat_Routes/Chat_Controller");
const router = express.Router();
const auth = require("../../middleware/auth");

router.post("/createChat", auth, Chat_Controller.createChat);
router.get("/getAllChats", auth, Chat_Controller.getAllChats);

module.exports = router;
