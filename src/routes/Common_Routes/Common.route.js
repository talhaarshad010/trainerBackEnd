/** @format */

const express = require("express");
const Common_controlller = require("./Common.Controller");
const uploadMiddleWare = require("../../config/multerConfig");
const checkAuth = require("../../config/checkAuth");

const router = express.Router();

router.post(
  "/InitializePaymentIntent",
  Common_controlller.InitializeStripePayment
);
router.post("/InitializeSetupIntent", Common_controlller.InitializeStripeSetup);
router.post("/GetStripeCards", Common_controlller.GetStripeCards);
router.delete(
  "/RemoveStripeCard/:paymentId",
  Common_controlller.RemoveStripeCard
);
router.get("/GetProfile/:token", Common_controlller.GetProfile);
router.post("/UpdateAddress", Common_controlller.UpdateAddress);
router.post(
  "/fileUpload",
  uploadMiddleWare.uploadMiddleware.single("file"),
  Common_controlller.fileUpload
);
router.post("/Follow", Common_controlller.Follow);
router.post("/unFollow", Common_controlller.Unfollow);
router.post("/acceptBooking", Common_controlller.acceptBooking);

module.exports = router;
