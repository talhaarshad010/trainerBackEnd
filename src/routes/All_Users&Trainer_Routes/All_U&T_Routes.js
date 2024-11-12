const express = require("express");

// This is for getting all users and trainers
const AllControllers = require("./All_U&T_Controller");
const router = express.Router();

router.get("/getAll", AllControllers.getAll);

module.exports = router;
