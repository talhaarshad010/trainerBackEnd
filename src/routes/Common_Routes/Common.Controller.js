/** @format */
const Stripe = require("stripe");
const CardModel = require("../../models/Card");
const TrainerModel = require("../../models/trainer");
const UserModel = require("../../models/user");
const jwt = require("jsonwebtoken");
const booking = require("../../models/booking");
const { s3 } = require("../../config/multerConfig");

// const InitializeStripePayment = async (req, res) => {
//   const { customerID, amount } = req.body;
//   console.log(customerID, amount);
//   const amountInCents = amount * 100;
//   console.log("api hit", customerID, amount);
//   const stripe = new Stripe(process.env.STRIPE_KEY, {
//     apiVersion: "2024-06-20",
//   });
//   // const customer = await stripe.customers.create({
//   //   email: 'finaltest21@gmail.com',
//   // })
//   const ephemeralKey = await stripe.ephemeralKeys.create(
//     { customer: customerID },
//     { apiVersion: "2020-08-27" }
//   );
//   const paymentIntent = await stripe.paymentIntents.create({
//     amount: amountInCents,
//     currency: "usd",
//     customer: customerID,
//     payment_method_types: ["card"],
//   });
//   console.log("emp key", ephemeralKey.secret);
//   console.log("paymentintent key", paymentIntent.client_secret);
//   res.send({
//     data: {
//       paymentIntent: paymentIntent.client_secret,
//       ephemeralKey: ephemeralKey.secret,
//       customer: customerID,
//     },
//     message: "Stripe initialized Successfully",
//     status: true,
//   });
// };

const InitializeStripePayment = async (req, res) => {
  const { customerID, amount } = req.body;
  console.log(customerID, amount);
  const amountInCents = amount * 100; // Convert amount to cents
  console.log("API hit", customerID, amount);

  const stripe = new Stripe(process.env.STRIPE_KEY, {
    apiVersion: "2020-08-27",
  });

  try {
    // Create ephemeral key for the customer
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customerID },
      { apiVersion: "2020-08-27" }
    );

    // Create a Payment Intent with manual capture
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      customer: customerID,
      payment_method_types: ["card"],
      capture_method: "manual", // Authorize the payment but don't capture yet
    });

    console.log("Ephemeral key", ephemeralKey.secret);
    console.log("Payment Intent client secret", paymentIntent.client_secret);

    res.send({
      data: {
        paymentIntent: paymentIntent.client_secret,
        ephemeralKey: ephemeralKey.secret,
        customer: customerID,
      },
      message: "Stripe initialized successfully",
      status: true,
    });
  } catch (error) {
    console.error("Error initializing Stripe payment", error);
    res.status(500).send({
      message: "Failed to initialize Stripe payment",
      status: false,
      error: error.message,
    });
  }
};

const InitializeStripeSetup = async (req, res) => {
  const { customerID } = req.body;
  console.log("is hitting: ", customerID);
  const stripe = new Stripe(process.env.STRIPE_KEY, {
    apiVersion: "2020-08-27",
  });

  const ephemeralKey = await stripe.ephemeralKeys.create(
    { customer: customerID },
    { apiVersion: "2020-08-27" }
  );
  const SetupIntent = await stripe.setupIntents.create({
    customer: customerID,
    payment_method_types: ["card"],
  });
  res.send({
    data: {
      setupIntents: SetupIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customerID,
    },
    message: "Stripe initialized Successfully",
    status: true,
  });
};

const stripe = new Stripe(process.env.STRIPE_KEY, {
  apiVersion: "2020-08-27",
});

const GetStripeCards = async (req, res) => {
  try {
    const { customerId } = req.body;

    if (!customerId) {
      return res.status(400).json({ error: "Customer ID is required" });
    }

    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: "card",
    });

    console.log("Payment Methods:", paymentMethods);
    res.json(paymentMethods);
  } catch (error) {
    console.error("Error retrieving payment methods:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// const GetStripeCards = async (req, res) => {
//   const { Email } = req.body;
//   console.log("email ::::::", Email);
//   const stripe = new Stripe(process.env.STRIPE_KEY, {
//     apiVersion: "2024-06-20",
//   });
//   const paymentMethods = await stripe.paymentMethods.list({
//     customer: Email,
//     type: "card",
//   });
//   console.log(paymentMethods);
// };

const GetCardDetail = async (req, res) => {
  const { token } = req.body;
  console.log("token", token);
  const decoded = jwt.verify(token, process.env.TOKEN_KEY);
  const { userID } = decoded;
  const CardDetails = await CardModel.find({ UserID: userID });

  if (CardDetails) {
    res.send({
      data: CardDetails,
      message: "Card added Successfully",
      status: true,
    });
  } else {
    res.status(403).json({
      message: "CardDetails not found",
      status: false,
    });
  }
};

// const RemoveCard = async (req, res) => {
//   const { CardID } = req.body;

//   console.log("is delete:", CardID);
//   try {
//     const CardDetails = await CardModel.deleteOne({ _id: CardID });

//     res.send({
//       data: CardDetails,
//       message: "Card removed Successfully",
//       status: true,
//     });
//   } catch (error) {
//     res.status(403).json({
//       message: "Card not found",
//       status: false,
//     });
//   }
// };

const RemoveStripeCard = async (req, res) => {
  const { paymentId } = req.params;
  console.log("id we get in backEnd:", paymentId);
  try {
    const deletedPaymentMethod = await stripe.paymentMethods.detach(paymentId);
    res.status(200).json({ success: true, deletedPaymentMethod });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const GetProfile = async (req, res) => {
  const { token } = req.params;

  const { userID } = jwt.verify(token, process.env.TOKEN_KEY);

  const [Trainer, User] = await Promise.all([
    TrainerModel.findOne({ _id: userID }),
    UserModel.findOne({ _id: userID }),
  ]);

  if (Trainer || User) {
    res.send({
      data: Trainer || User,
      message: Trainer ? "Trainer Found" : "User Found",
      status: true,
    });
  } else {
    res.status(404).json({
      message: "User or Trainer not found",
      status: false,
    });
  }
};

const UpdateAddress = async (req, res) => {
  const { token, updatedAddress } = req.body;
  console.log("first", token, updatedAddress);
  const decoded = jwt.verify(token, process.env.TOKEN_KEY);
  const { userID } = decoded;
  const [Trainer, User] = await Promise.all([
    TrainerModel.findOne({ _id: userID }),
    UserModel.findOne({ _id: userID }),
  ]);

  if (Trainer) {
    const UpdateTrainer = await TrainerModel.updateOne(
      { _id: userID },
      {
        $set: {
          Address: updatedAddress,
        },
      }
    );
    res.send({
      data: UpdateTrainer,
      message: "Address of trainer updated succesfully",
      status: true,
    });
  } else if (User) {
    const UpdateUser = await UserModel.updateOne(
      { _id: userID },
      {
        $set: {
          Address: updatedAddress,
        },
      }
    );
    console.log(UpdateUser);
    res.send({
      data: UpdateUser,
      message: "Address of user updated succesfully",
      status: true,
    });
  }
};

const fileUpload = async (req, res) => {
  if (!req.file) {
    return res
      .status(403)
      .json({ status: false, error: "Please upload a file" });
  }

  const email = req.body?.email;
  if (!email) {
    return res
      .status(401)
      .json({ status: false, error: "User not authenticated" });
  }
  const imageData = {
    url: req.file.location,
    type: req.file.mimetype,
  };
  try {
    let user = await UserModel.findOne({ email });

    if (!user) {
      user = await TrainerModel.findOne({ email });
    }

    if (user) {
      await user.constructor.findByIdAndUpdate(user._id, {
        profileImage: imageData.url,
      });

      return res.send({
        data: imageData,
        status: true,
      });
    } else {
      return res.status(404).json({ status: false, error: "User not found" });
    }
  } catch (error) {
    console.error("Error during file upload:", error);
    return res
      .status(500)
      .json({ status: false, error: "Internal server error" });
  }
};

const Follow = async (req, res) => {
  const { userID, trainerID } = req.body;

  try {
    const follower = await UserModel.findById(userID);
    const following = await TrainerModel.findById(trainerID);

    if (!follower) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!following) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    if (follower?.followedTrainers?.includes(trainerID)) {
      return res
        .status(201)
        .json({ message: "Already following", status: false });
    }

    follower.followedTrainers.push(trainerID);
    following.followers.push(userID);

    await follower.save();
    await following.save();

    res.status(200).json({
      message: "Followed successfully",
      status: true,
      data: follower,
    });
  } catch (error) {
    console.error("Error following trainer:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const Unfollow = async (req, res) => {
  const { userID, trainerID } = req.body;

  try {
    const follower = await UserModel.findById(userID);
    const following = await TrainerModel.findById(trainerID);

    // Check if both the follower and trainer exist
    if (!follower) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!following) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    // Check if the user is actually following the trainer
    if (!follower.followedTrainers.includes(trainerID)) {
      return res
        .status(200)
        .json({ message: "Not following this trainer", status: false });
    }

    // Remove trainer from followedTrainers and user from trainer's followers
    follower.followedTrainers = follower.followedTrainers.filter(
      (id) => id.toString() !== trainerID.toString()
    );
    following.followers = following.followers.filter(
      (id) => id.toString() !== userID.toString()
    );

    await follower.save();
    await following.save();

    res.status(200).json({ message: "Unfollowed successfully", status: true });
  } catch (error) {
    console.error("Error unfollowing trainer:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const acceptBooking = async (req, res) => {
  const { bookingId } = req.body;

  try {
    // Find the booking
    const fBooking = await booking.findById(bookingId);

    if (!fBooking) {
      return res.status(404).json({
        message: "Booking not found",
        status: false,
      });
    }

    // Check if booking is already accepted
    if (fBooking.paymentStatus === "accepted") {
      return res.status(400).json({
        message: "Booking already accepted",
        status: false,
      });
    }

    // const paymentIntent = await stripe.paymentIntents.retrieve(id);
    console.log("Found", fBooking);
    // return;
    // Update booking status to accepted
    // fBooking.paymentStatus = "accepted";
    // await fBooking.save();

    // Capture the payment
    const stripe = new Stripe(process.env.STRIPE_KEY, {
      apiVersion: "2020-08-27",
    });

    const confirmedPaymentIntent = await stripe.paymentIntents.confirm(
      fBooking.paymentIntentId
      // {
      //   payment_method: paymentMethodId,
      // }
    );
    console.log("INTENDDD", confirmedPaymentIntent);
    if (confirmedPaymentIntent.status === "succeeded") {
      const paymentIntent = await stripe.paymentIntents.capture(
        fBooking.paymentIntentId
      );

      // Update booking payment status
      fBooking.paymentStatus =
        paymentIntent.status === "succeeded" ? "completed" : "failed";
      await fBooking.save();

      res.status(200).json({
        message: "Booking accepted and payment processed",
        fBooking,
      });
    }
  } catch (error) {
    console.error("Error accepting booking:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
      newError: error,
      status: false,
    });
  }
};

module.exports = {
  GetProfile,
  UpdateAddress,
  RemoveStripeCard,
  InitializeStripePayment,
  InitializeStripeSetup,
  GetStripeCards,
  fileUpload,
  Follow,
  Unfollow,
  acceptBooking,
};
