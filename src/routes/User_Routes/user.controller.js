const userModel = require("../../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../../utils/helperFunc");
const { default: Stripe } = require("stripe");
const booking = require("../../models/booking");
/** @format */

/**
 * @function  User_Signup
 * @description API Will be /user/userSignup
 * @example User_Signup
 */

const userSignup = async (req, res) => {
  const { email, password } = req.body;
  try {
    let checkEmail = await userModel.findOne({ email });
    console.log(checkEmail);
    if (!checkEmail) {
      console.log("User not found");
      const salt = await bcrypt.genSalt();
      const hashPassword = await bcrypt.hash(password, salt);
      const stripe = new Stripe(process.env.STRIPE_KEY, {
        apiVersion: "2024-06-20",
      });
      const customer = await stripe.customers.create({
        email: email,
        name: req.body.fullName,
      });
      let resultUser = await userModel.create({
        ...req.body,
        password: hashPassword,
        stripeCustomerID: customer.id,
      });

      // const mailOptions = {
      //   from: "abdul.basit@logicloopsolutions.net",
      //   to: email,
      //   subject: "Verify Your Email Address",
      //   html: `
      //   <p>Thank you for signing up!</p>
      //   <p>Please verify your email address by clicking the following link:</p>
      //   <a href="${process.env.APP_URL}/verify-email?token=${token}">Verify Email</a>
      //   `,
      // };

      // await sendEmail(mailOptions);

      // res.send({
      //   data: resultUser,
      //   message:
      //     "User created successfully. Please check your email for verification.",
      res.send({
        data: resultUser,
        message: "User created Successfully",
        status: true,
      });
    } else {
      console.log("User found");
      res.status(403).json({
        message: "User already exist",
        status: false,
      });
    }
  } catch (error) {
    res.status(500).json({
      error: "An error occurred",
      status: false,
    });
    console.log("Error:", error);
  }
};

/**
 * @function  User_Login
 * @description API Will be /user/userLogin
 * @example User_Login
 */

const userLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const checkUser = await userModel.findOne({ email });
    if (!!checkUser) {
      let checkPassword = await bcrypt.compare(password, checkUser.password);

      if (!!checkPassword) {
        const jwt_token = await jwt.sign(
          { userID: checkUser?._id, email, type: checkUser?.isType },
          process.env.TOKEN_KEY
        );
        console.log("JWT", jwt_token);

        const Copy = await JSON.parse(JSON.stringify(checkUser));
        Copy.token = jwt_token;
        delete Copy.password;

        res.status(200).send({
          data: Copy,
        });
      } else {
        res.status(403).send({
          message: "Invalid email/password",
          status: false,
        });
      }
    } else {
      res.status(403).json({
        message: "Invalid email/password",
        status: false,
      });
    }
  } catch (error) {
    res.status(403).json({
      error: error,
      status: false,
    });
  }
};

/**
 * @function User_ForgetPassword
 * @description API Will be /user/forgetPassword
 * @example User_ForgetPassword
 */

const forgetPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const findUser = await userModel.findOne({ email });
    if (!!findUser) {
      const { _id, fullName, email } = findUser;

      const Random = "0123456789";
      let code = "";
      for (let i = 0; i < 4; i++) {
        code += Random[Math.floor(Math.random() * Random.length)];
      }

      const expiryDate = new Date(Date.now() + 120000);
      const UpdateUser = await userModel.updateOne(
        { _id },
        {
          $set: {
            resetPasswordVerificationCode: code,
            resetcodeExpiry: expiryDate,
          },
        }
      );

      if (!!UpdateUser) {
        const htmlEmail = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Template</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6;">
            <p>Dear ${fullName},</p>
            <p>Here is your verification code to reset your password. Please use it within the next 2 minutes.</p>
            <hr>
            <p><strong>Verification Code:</strong> ${code}</p>
            <hr>
            <p>If you didn't request this verification code, please ignore this message.</p>
            <br>
            <p>Best regards,<br>Trainer Support Team</p>
        </body>
        </html>
        `;

        const mailContent = {
          from: "abdul.basit@logicloopsolutions.net", //Sender//,
          to: email, //Reciever//,
          subject: "Verification Code - Trainer ",
          html: htmlEmail,
        };
        console.log("CODE", code);
        sendEmail(mailContent);
        res.status(200).json({
          message: "Code Sent",
          status: true,
          data: {
            id: _id,
            email: email,
          },
        });
      }
    } else {
      res.status(403).json({
        message: "Can't find user",
        status: false,
      });
    }
  } catch (error) {
    res.status(403).json({
      error: error,
      status: false,
    });
  }
};

/**
 * @function User_OTPVERIFY
 * @description API Will be /user/otpVerify/id
 * @example User_OTPVERIFY
 */

const otpverify = async (req, res) => {
  try {
    const { id } = req.params;
    const { resetPasswordVerificationCode } = req.body;

    const findUser = await userModel.findOne({ _id: id });

    if (!!findUser) {
      console.log("SERVERS", findUser.resetPasswordVerificationCode);
      console.log("Frontend", resetPasswordVerificationCode);
      if (
        resetPasswordVerificationCode !== findUser.resetPasswordVerificationCode
      ) {
        return res.status(403).json({
          message: "Invalid/Expire Code",
          status: false,
        });
      }
      if (
        resetPasswordVerificationCode === findUser.resetPasswordVerificationCode
      ) {
        if (new Date() > findUser.resetcodeExpiry) {
          return res.status(403).json({
            message: "Code has been expired",
            status: false,
          });
        }
      }

      const result = await userModel.updateOne(
        { _id: id },
        {
          $set: {
            resetPasswordVerificationCode: null,
            resetcodeExpiry: null,
          },
        }
      );

      if (!!result) {
        res.status(200).json({
          message: "OTP has been Verified Successfully",
          status: true,
        });
      }
    } else {
      return res.status(403).json({
        message: "Cannot Find User",
        status: false,
      });
    }
  } catch (error) {
    return res.status(403).json({
      message: error,
      status: false,
    });
  }
};

/**
 * @function RESET_PASSWORD
 * @description API Will be /user/resetPassword/id
 * @example RESET_PASSWORD
 */

const resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    const findUser = await userModel.findOne({ _id: id });

    if (!!findUser) {
      const salt = await bcrypt.genSalt();
      const hash = await bcrypt.hash(password, salt);

      const result = await userModel.updateOne(
        { _id: id },
        {
          $set: {
            password: hash,
            resetPasswordVerificationCode: "",
          },
        }
      );

      if (!!result) {
        res.status(200).json({
          message: "Password Changed Successfully",
          data: result,
        });
      }
    } else {
      res.status(403).json({
        message: "Cannot Find User ",
        status: false,
      });
    }
  } catch (error) {
    res.status(403).json({
      error: error,
      status: false,
    });
  }
};
const changePassword = async (req, res) => {
  const { id, oldPassword, newPassword, confirmNewPassword } = req.body;
  console.log("jkdjsk", id, oldPassword, newPassword, confirmNewPassword);
  try {
    const findUser = await userModel.findOne({ _id: id });

    if (!findUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const match = await bcrypt.compare(oldPassword, findUser.password);

    if (!match) {
      return res.status(401).json({ message: "Old password is incorrect" });
    }
    if (oldPassword === newPassword) {
      return res
        .status(400)
        .json({ message: "New password must be different from old password" });
    }
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ message: "New passwords do not match" });
    }

    const salt = await bcrypt.genSalt();
    const hashPass = await bcrypt.hash(newPassword, salt); // Await the hashing

    findUser.password = hashPass;

    await findUser.save(); // Await the save operation

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const verifyEmail = async (req, res) => {
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);

    const user = await userModel.findOne({ email: decoded.email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        status: false,
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        message: "Email already verified",
        status: false,
      });
    }

    user.isVerified = true;
    let a = await user.save();

    const mailOptions = {
      from: "talha@logicloopsolutions.net",
      to: decoded.email,
      subject: "Verified",
      html: `<p style="color:blue" >Thank you for verifying the user</p>`,
    };
    if (a) {
      await sendEmail(mailOptions);
      console.log("VVVVVVV", a);
    }

    res.status(200).json({
      message: "Email verified successfully",
      status: true,
    });
  } catch (error) {
    console.log("ERRRRRRR", error);
    res.status(400).json({
      message: "Invalid or expired token",
      status: false,
      error: error,
    });
  }
};

const UpdateProfile = async (req, res) => {
  const { id, bio, speciality, rate, availability, image } = req.params;
  const findUser = await userModel.findOne({ _id: id });
  try {
    if (!!findUser) {
      const result = await userModel.updateOne(
        {
          _id: id,
        },
        {
          $set: {
            Bio: bio,
            Speciality: speciality,
            Rate: rate,
            Availability: availability,
            Image: "dummy.png",
          },
        }
      );

      if (!!result) {
        res.status(200).json({
          message: "Password Updated Successfully",
          data: result,
        });
      } else {
        res.status(403).json({
          message: "Cannot Update User ",
          status: false,
        });
      }
    } else {
      res.status(403).json({
        message: "Cannot Find User ",
        status: false,
      });
    }
  } catch (error) {
    res.status(403).json({
      error: error,
      status: false,
    });
  }
};

// const CreateBooking = async (req, res) => {
//   try {
//     const { token, userName } = req.body;
//     console.log("backend pe bhi mil gya", req.body);
//     console.log("backend pe", userName);
//     const { userID } = jwt.verify(token, process.env.TOKEN_KEY);
//     const Result = await booking.create({ ...req.body, UserID: userID });

//     if (Result) {
//       res.status(200).json({
//         message: "Booking Created Successfully",
//         data: Result,
//       });
//     } else {
//       res.status(404).json({
//         message: "User not found",
//         status: false,
//       });
//     }
//   } catch (error) {
//     res.status(403).json({
//       error: error,
//       status: false,
//     });
//   }
// };

const CreateBooking = async (req, res) => {
  try {
    const { token, userName, Amount } = req.body; // Assume amount is included in the request
    console.log("Request body:", req.body);
    console.log("User Name:", userName);

    const { userID } = jwt.verify(token, process.env.TOKEN_KEY);
    const findcustomer = await userModel.findOne({ _id: userID });

    // Create the payment intent first
    const stripe = new Stripe(process.env.STRIPE_KEY, {
      apiVersion: "2024-06-20",
    });
    const amountInCents = Amount * 100;

    // Create a Payment Intent with manual capture
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      customer: findcustomer.stripeCustomerID, // Make sure to link to the correct customer
      payment_method_types: ["card"],
      capture_method: "manual",
    });
    console.log("Payment Intent:", paymentIntent);

    // Create the booking with the payment intent ID
    const bookingData = {
      ...req.body,
      UserID: userID,
      paymentIntentId: paymentIntent.id,
    };
    const result = await booking.create(bookingData);

    if (result) {
      res.status(200).json({
        message: "Booking created successfully",
        data: result,
        paymentIntent: paymentIntent.client_secret, // Send client secret for the payment
      });
    } else {
      res.status(404).json({
        message: "Failed to create booking",
        status: false,
      });
    }
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
      status: false,
    });
  }
};

const updateBooking = async (req, res) => {
  const { bookingId } = req.body;

  try {
    const result = await booking.findByIdAndUpdate(
      bookingId,
      {
        notificationSent: false,
      },
      { new: true }
    );

    res.status(200).json({
      message: "Notification marked as read",
      status: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      error: "An error occurred",
      status: false,
    });
  }
};

const DeleteBooking = async (req, res) => {
  try {
    const { token, bookingId } = req.body;
    console.log(token, bookingId);
    const { userID } = jwt.verify(token, process.env.TOKEN_KEY);

    const bookings = await booking.findOne({ _id: bookingId, UserID: userID });
    if (!bookings) {
      return res.status(404).json({
        message:
          "Booking not found or you do not have permission to delete this booking",
        status: false,
      });
    }

    await booking.deleteOne({ _id: bookingId });

    res.status(200).json({
      message: "Booking deleted successfully",
      status: true,
    });
  } catch (error) {
    res.status(403).json({
      error: error.message || "An error occurred",
      status: false,
    });
  }
};

const GetBookings = async (req, res) => {
  try {
    const { token } = req.query;
    console.log("bookings mil gai:", req.query);
    const { userID } = jwt.verify(token, process.env.TOKEN_KEY);
    console.log("data", userID);
    const bookings = await booking.find({ UserID: userID });
    console.log("bookingsssssssssssss", bookings);

    if (bookings.length > 0) {
      res.status(200).json({
        message: "Bookings retrieved successfully",
        data: bookings,
      });
    } else {
      res.status(200).json({
        message: "No bookings found for this user",
        status: false,
      });
    }
  } catch (error) {
    res.status(403).json({
      error: error.message,
      status: false,
    });
  }
};

const getBookbyId = async (req, res) => {
  try {
    const { trainerId } = req.params;

    const bookings = await booking.find({ trainerId });

    // console.log("NEW BOOKINGS", trainerId);
    // console.log("bookingsssssssssssss", bookings);

    if (bookings.length > 0) {
      res.status(200).json({
        message: "Bookings retrieved successfully",
        data: bookings,
      });
    } else {
      res.status(200).json({
        message: "No bookings found for this Trainer",
        status: true,
      });
    }
  } catch (error) {
    res.status(403).json({
      error: error.message,
      status: false,
    });
  }
};

const FavouriteTrainers = async (req, res) => {
  const { name, rating, trainerID, userId, trainerProfile } = req.body;
  console.log("Alright Now Hitting ", name, rating, trainerID, userId);

  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.favoriteTrainers) {
      user.favoriteTrainers = [];
    }

    const existingTrainer = user.favoriteTrainers.find(
      (trainer) => trainer.trainerID === trainerID
    );

    if (existingTrainer) {
      return res.status(400).json({
        message: "Trainer is already in favorites",
        trainer: existingTrainer,
      });
    }

    const newTrainer = {
      userId,
      trainerID,
      name,
      rating,
      trainerProfile,
    };

    user.favoriteTrainers.push(newTrainer);
    await user.save();

    res.status(201).json({
      message: "Trainer added to favorites",
      data: newTrainer,
    });
  } catch (error) {
    res.status(500).json({ message: "Error adding favorite trainer", error });
  }
};

const GetFavouriteTrainers = async (req, res) => {
  const { userId } = req.params;
  console.log("Fetching favorite trainers for user:", userId);

  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const favoriteTrainers = user.favoriteTrainers || [];
    res.status(200).json({
      message: "Favorite trainers retrieved successfully",
      data: favoriteTrainers,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving favorite trainers", error });
  }
};
const deleteFavouriteTrainers = async (req, res) => {
  const { userId, trainerID } = req.body;
  console.log("Data received:", userId, trainerID);

  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!user.favoriteTrainers || user.favoriteTrainers.length === 0) {
      return res.status(404).json({ message: "No favorite trainers found." });
    }

    const trainerIndex = user.favoriteTrainers.findIndex(
      (trainer) => trainer.trainerID === trainerID
    );

    if (trainerIndex === -1) {
      return res
        .status(404)
        .json({ message: "Trainer not found in favorites." });
    }

    user.favoriteTrainers.splice(trainerIndex, 1);

    await user.save();

    res.status(200).json({ message: "Trainer removed successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error removing trainer: " + error.message });
  }
};
const followedTrainers = async (req, res) => {
  const { name, rating, trainerID, userId, isFollow } = req.body;
  console.log(name, rating, trainerID, userId, isFollow);

  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.followedTrainers) {
      user.followedTrainers = [];
    }

    const existingTrainer = user.followedTrainers.find(
      (trainer) => trainer.trainerID === trainerID
    );

    if (existingTrainer) {
      return res.status(400).json({
        message: "Trainer is already in followers",
        trainer: existingTrainer,
      });
    }

    const newTrainer = {
      name,
      rating,
      trainerID,
      userId,
      isFollow,
    };

    user.followedTrainers.push(newTrainer);
    await user.save();

    res.status(201).json({
      message: "Trainer added to followers",
      data: newTrainer,
    });
  } catch (error) {
    res.status(500).json({ message: "Error adding following trainer", error });
  }
};
const removeFollowedTrainer = async (req, res) => {
  const { trainerID, userId } = req.body;

  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const trainerIndex = user.followedTrainers.findIndex(
      (trainer) => trainer.trainerID === trainerID
    );

    if (trainerIndex === -1) {
      return res.status(400).json({
        message: "Trainer not found in followed trainers",
      });
    }

    user.followedTrainers.splice(trainerIndex, 1);
    await user.save();

    res.status(200).json({
      message: "Trainer removed from followers",
      trainerID,
    });
  } catch (error) {
    res.status(500).json({ message: "Error removing followed trainer", error });
  }
};
const getAllUsers = async (req, res) => {
  console.log("Running");
  try {
    const result = await userModel.find({});
    console.log("userssss", result);
    if (result) {
      res.status(200).json({
        data: result,
      });
    }
  } catch (error) {
    res.status(403).json({
      status: false,
      error: error,
    });
  }
};
module.exports = {
  userSignup,
  userLogin,
  forgetPassword,
  resetPassword,
  changePassword,
  verifyEmail,
  UpdateProfile,
  CreateBooking,
  DeleteBooking,
  GetBookings,
  FavouriteTrainers,
  GetFavouriteTrainers,
  deleteFavouriteTrainers,
  followedTrainers,
  removeFollowedTrainer,
  otpverify,
  getAllUsers,
  getBookbyId,
  updateBooking,
};
