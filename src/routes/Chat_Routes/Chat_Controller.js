const chatModel = require("../../models/chat");

require("dotenv").config();
console.log(process.env.SECRET);

const createChat = async (req, res) => {
  const { userId, type } = req.body;

  let userIds = [
    { userId: req.user.userID, type: req.user.type },
    { userId: userId, type: type },
  ];

  try {
    const chat = await chatModel.findOne({
      // $and: userIds.map((user) => ({
      //   participants: {
      //     $elemMatch: {
      //       userId: user.userId,
      //       type: user.type,
      //     },
      //   },
      // })),

      // we can also use the above code //
      participants: {
        $all: userIds.map((user) => ({
          userId: user.userId,
          type: user.type,
        })),
      },
    });

    if (!!chat) {
      return res.send({
        data: chat,
        status: true,
      });
    }

    const newChat = await chatModel.create({
      participants: userIds,
    });

    res.send({
      data: newChat,
      status: true,
    });
  } catch (error) {
    res.status(401).json({
      status: false,
      message: error,
    });
  }
};

const getAllChats = async (req, res) => {
  try {
    const myChats = await chatModel
      .find({
        participants: {
          $elemMatch: {
            userId: req.user.userID,
          },
        },
      })
      .populate({
        path: "participants.userId",
        select: "profileImage fullName",
        $match: {
          "participants.userId": { $ne: req.user.userID },
        },
      });

    res.send({
      data: myChats,
    });
  } catch (error) {
    res.status(401).json({
      status: false,
      message: error,
    });
  }
};

module.exports = { createChat, getAllChats };
