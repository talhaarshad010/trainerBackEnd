const chatModel = require("../../models/chat");
const messageModel = require("../../models/messages");

require("dotenv").config();
console.log(process.env.SECRET);

const createMessage = async (req, res) => {
  const { chatId, text } = req.body;

  try {
    const newMessage = await messageModel.create({
      text,
      chatId,
      "user._id": req.user.userID,
      "user.type": req.user.type,
    });

    await chatModel.findByIdAndUpdate(
      chatId,
      { latestmessage: text },
      { new: true }
    );

    res.send({
      data: newMessage,
      status: true,
    });
  } catch (error) {
    res.status(401).json({
      status: false,
      message: error,
    });
  }
};

const getAllMessages = async (req, res) => {
  const chatId = req.query.chatId;
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const skip = (page - 1) * limit;
  try {
    const myChats = await messageModel
      .find({
        chatId,
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

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

module.exports = { createMessage, getAllMessages };
