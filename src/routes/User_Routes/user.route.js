/** @format */

const express = require("express");
const user_controlller = require("./user.controller");
const router = express.Router();
const auth = require("../../middleware/auth");
router.post("/userSignup", user_controlller.userSignup);
router.post("/userLogin", user_controlller.userLogin);
router.post("/Verifyemail", user_controlller.verifyEmail);
router.post("/CreateBooking", user_controlller.CreateBooking);

router.delete("/DeleteBooking", user_controlller.DeleteBooking);
router.get("/GetBookings", user_controlller.GetBookings);
router.get("/getBookingbyId/:trainerId", user_controlller.getBookbyId);
router.post("/updateBooking", user_controlller.updateBooking);
router.post("/favoritetrainers", user_controlller.FavouriteTrainers);
router.delete(
  "/Deletefavoritetrainers",
  user_controlller.deleteFavouriteTrainers
);
router.get(
  "/Getfavoritetrainers/:userId",
  user_controlller.GetFavouriteTrainers
);
router.post("/followedTrainers", user_controlller.followedTrainers);
router.post("/removeFollowedTrainers", user_controlller.removeFollowedTrainer);
router.post("/updateProfile", user_controlller.UpdateProfile);
router.post("/forgetPassword", user_controlller.forgetPassword);
router.patch("/resetPassword/:id", user_controlller.resetPassword);
router.post("/changePassword", user_controlller.changePassword);
router.post("/otpVerify/:id", user_controlller.otpverify);
router.get("/getAllUsers", auth, user_controlller.getAllUsers);
module.exports = router;
