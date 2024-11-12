const express = require("express");
const Messages_Controller = require("../Messages_Routes/Messages_Controller");
const router = express.Router();
const auth = require("../../middleware/auth");

router.post("/createMessage", auth, Messages_Controller.createMessage);
router.get("/getAllMessages", auth, Messages_Controller.getAllMessages);

module.exports = router;
