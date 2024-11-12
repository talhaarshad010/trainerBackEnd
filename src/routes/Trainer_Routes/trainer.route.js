/** @format */

const express = require("express");
const trainer_controlller = require("./Trainer.controller");
const auth = require("../../middleware/auth");
const router = express.Router();
const upload = require("../../config/multerConfig");
const checkAuth = require("../../config/checkAuth");

router.post("/trainerSignup", trainer_controlller.TrainerSignup);
router.post("/GetTrainer", trainer_controlller.TrainerData);
router.post("/trainerLogin", trainer_controlller.TrainerLogin);
router.post("/update", trainer_controlller.TrainerUpdateProfile);
router.post("/forgetPassword", trainer_controlller.TrainerforgetPassword);
router.post("/VerifyOTP/:id", trainer_controlller.Trainerotpverify);
router.patch("/resetPassword/:id", trainer_controlller.TrainerresetPassword);
router.get("/getAllTrainers", auth, trainer_controlller.getAllTrainers);

router.post(
  "/uploadProfileImage",
  upload.uploadMiddleware.single("profileImage"),
  trainer_controlller.uploadProfileImage
);
router.post(
  "/trainerUploads",
  upload.uploadMiddleware.array("files"),
  trainer_controlller.trainerUploads
);
router.delete(
  "/deleteProfileImage",
  checkAuth,
  trainer_controlller.deleteProfileImage
);
module.exports = router;
