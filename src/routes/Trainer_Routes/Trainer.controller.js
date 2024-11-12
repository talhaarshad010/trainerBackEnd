/** @format */

const TrainerModel = require("../../models/trainer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../../utils/helperFunc");
const { default: Stripe } = require("stripe");

const TrainerData = async (req, res) => {
  const { email } = req.body;
  try {
    let TrainProfile = await TrainerModel.findOne({ email: email });
    console.log(TrainProfile);
    if (TrainProfile) {
      res.send({
        data: TrainProfile,
        message: "User found",
        status: true,
      });
    }
  } catch (error) {
    res.status(404).json({
      error: "ok",
      status: false,
    });
    console.log("Not Found", error);
  }
};

const TrainerSignup = async (req, res) => {
  const { email, password, Address } = req.body;
  console.log("Address", Address);
  try {
    let checkEmail = await TrainerModel.findOne({ email });

    if (!checkEmail) {
      const salt = await bcrypt.genSalt();
      const hashPassword = await bcrypt.hash(password, salt);

      // const token = jwt.sign({ email }, process.env.TOKEN_KEY);
      const stripe = new Stripe(process.env.STRIPE_KEY, {
        apiVersion: "2024-06-20",
      });
      const customer = await stripe.customers.create({
        email: email,
      });
      console.log("STRINTTTTT", customer);
      let resultUser = await TrainerModel.create({
        ...req.body,
        password: hashPassword,
        // token,
        stripeCustomerID: customer.id,
      });
      // const mailOptions = {
      //   from: "talha@logicloopsolutions.net",
      //   to: email,
      //   subject: "Verify Your Email Address",
      //   html: `
      //     <p>Thank you for signing up!</p>
      //     <p>Please verify your email address by clicking the following link:</p>
      //     <a href='http://localhost:6000/trainer/Verifyemail?token=${token}'>Click to Verify Your Email</a>
      //   `,
      // };

      // await sendEmail(mailOptions);

      res.send({
        data: resultUser,
        // message:
        //   "User created successfully. Please check your email for verification.",
        message: "Trainer created Successfully",
        status: true,
      });
    } else {
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

const TrainerLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const checkUser = await TrainerModel.findOne({ email });
    if (!!checkUser) {
      let checkPassword = await bcrypt.compare(password, checkUser.password);

      if (!!checkPassword) {
        const jwt_token = await jwt.sign(
          { userID: checkUser?._id, email, type: checkUser.isType },
          process.env.TOKEN_KEY
        );
        console.log("JWTTT", jwt_token);
        const Copy = await JSON.parse(JSON.stringify(checkUser));
        Copy.token = jwt_token;
        delete Copy.password;
        const UpdateUser = await TrainerModel.updateOne(
          { _id: checkUser?._id },
          {
            $set: { token: jwt_token },
          }
        );
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

const TrainerforgetPassword = async (req, res) => {
  const { email } = req.body;
  console.log(req.body);
  try {
    const findUser = await TrainerModel.findOne({ email });
    if (!!findUser) {
      const { _id, fullName, email } = findUser;

      const Random = "0123456789";
      let code = "";
      for (let i = 0; i < 4; i++) {
        code += Random[Math.floor(Math.random() * Random.length)];
      }

      const expiryDate = new Date(Date.now() + 120000);
      const UpdateUser = await TrainerModel.updateOne(
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
          from: "abdul.basit@logicloopsolutions.net",
          to: email, //Reciever//,
          subject: "Verification Code - Trainer ",
          html: htmlEmail,
        };
        sendEmail(mailContent);
        console.log(code);
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

const Trainerotpverify = async (req, res) => {
  try {
    const { id } = req.params;
    const { resetPasswordVerificationCode } = req.body;

    const findUser = await TrainerModel.findOne({ _id: id });

    if (!!findUser) {
      console.log("SERVERS", findUser.resetPasswordVerificationCode);
      console.log("Frontend", resetPasswordVerificationCode);
      if (
        resetPasswordVerificationCode !== findUser.resetPasswordVerificationCode
      ) {
        return res.status(403).json({
          message: "Invalid Code",
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

      const result = await TrainerModel.updateOne(
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

const TrainerresetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    const findUser = await TrainerModel.findOne({ _id: id });
    if (!!findUser) {
      console.log("PAAAASSS", password);
      const salt = await bcrypt.genSalt();
      const hash = await bcrypt.hash(password, salt);

      const result = await TrainerModel.updateOne(
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

const TrainerUpdateProfile = async (req, res) => {
  const {
    email,
    Bio,
    Speciality,
    Hourlyrate,
    Availiblity,
    Address,
    fullName,
    Dob,
    gender,
  } = req.body;
  console.log(req.body);
  const findUser = await TrainerModel.findOne({ email: email });
  const existingAvailability = findUser.Availiblity;
  const existingSpecialities = findUser.Speciality;
  try {
    if (findUser) {
      const updatedAvailability = [
        ...existingAvailability,
        ...Availiblity.filter((time) => !existingAvailability.includes(time)),
      ];

      const updatedSpecialities = [
        ...existingSpecialities,
        ...Speciality.filter(
          (special) =>
            special?.key &&
            !existingSpecialities.some((item) => item.key === special.key)
        ),
      ];

      // Remove duplicates by creating a unique Set of keys
      const uniqueSpecialities = Array.from(
        new Map(updatedSpecialities.map((item) => [item.key, item])).values()
      );

      const result = await TrainerModel.updateOne(
        {
          email: email,
        },
        {
          $set: {
            fullName: fullName,
            Bio: Bio,
            Dob: Dob,
            gender: gender,
            Speciality: uniqueSpecialities,
            Hourlyrate: Hourlyrate,
            Availiblity: updatedAvailability,
            Address: Address,
          },
        }
      );

      if (result) {
        res.status(200).json({
          message: "Updated Successfully",
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

const uploadProfileImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  const { filename } = req.file;
  console.log("first", filename);
  const email = req.body.email;

  if (!email) {
    return res.status(400).send("Email not provided.");
  }

  try {
    const trainer = await TrainerModel.findOne({ email });
    if (!trainer) {
      return res.status(404).send("Trainer not found.");
    }

    trainer.profileImage = filename;
    await trainer.save();

    res.status(200).json({
      message: "Profile image uploaded successfully!",
      filename: filename,
    });
  } catch (error) {
    console.error("Error updating profile image:", error);
    res.status(500).send("Failed to update profile image.");
  }
};

const trainerUploads = async (req, res) => {
  console.log("Data from front end:", req.body);

  // Check for files and email
  if (!req.files || req.files.length === 0) {
    return res
      .status(403)
      .json({ status: false, error: "Please upload at least one file" });
  }

  const email = req.body?.email;
  if (!email) {
    return res
      .status(401)
      .json({ status: false, error: "User not authenticated" });
  }

  const imagesData = req.files.map((file) => ({
    url: file.location,
    type: file.mimetype,
  }));

  try {
    let user =
      (await UserModel.findOne({ email })) ||
      (await TrainerModel.findOne({ email }));

    if (user) {
      await user.constructor.findByIdAndUpdate(user._id, {
        $push: { trainerUploads: { $each: imagesData } },
      });

      return res.json({
        data: imagesData,
        status: true,
      });
    } else {
      return res.status(404).json({ status: false, error: "User not found" });
    }
  } catch (error) {
    console.error("Error during file upload:", {
      message: error.message,
      stack: error.stack,
      data: req.body, // Log request body for context
      files: req.files,
    });
    return res
      .status(500)
      .json({ status: false, error: "Internal server error" });
  }
};

const deleteProfileImage = async (req, res) => {
  const email = req.body?.email;

  if (!email) {
    return res
      .status(401)
      .json({ status: false, error: "User not authenticated" });
  }

  try {
    let user = await UserModel.findOne({ email });

    if (!user) {
      user = await TrainerModel.findOne({ email });
    }

    if (user) {
      const imageUrl = user.profileImage;

      // If there's an image to delete
      if (imageUrl) {
        // Extract the file name from the URL
        const fileName = imageUrl.split("/").pop();

        // Delete the image from S3
        const deleteParams = {
          Bucket: process.env.S3_BUCKET_NAME,
          Key: fileName,
        };

        await s3.send(new DeleteObjectCommand(deleteParams));

        // Update user's profile image field
        await user.constructor.findByIdAndUpdate(user._id, {
          profileImage: null, // or set to a default image URL
        });

        return res.json({
          status: true,
          message: "Profile image deleted successfully",
        });
      } else {
        return res
          .status(404)
          .json({ status: false, error: "No profile image to delete" });
      }
    } else {
      return res.status(404).json({ status: false, error: "User not found" });
    }
  } catch (error) {
    console.error("Error during profile image deletion:", error);
    return res
      .status(500)
      .json({ status: false, error: "Internal server error" });
  }
};

const getAllTrainers = async (req, res) => {
  try {
    const result = await TrainerModel.find({});

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
  TrainerSignup,
  TrainerLogin,
  TrainerforgetPassword,
  Trainerotpverify,
  TrainerresetPassword,
  TrainerData,
  uploadProfileImage,
  trainerUploads,
  deleteProfileImage,
  TrainerUpdateProfile,
  getAllTrainers,
};
