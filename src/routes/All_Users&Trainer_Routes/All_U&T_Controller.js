const User = require("../../models/user");
const Trainer = require("../../models/trainer");
require("dotenv").config();

const getAll = async (req, res) => {
  try {
    const [users, trainers] = await Promise.all([
      User.find({}),
      Trainer.find({}),
    ]);
    let data = [];

    await data.push(...users, ...trainers);

    if (data) {
      console.log("Length", data.length);
      res.send({
        data: data,
        status: true,
      });
    }
  } catch (error) {
    res.send({
      data: error.message,
    });
  }
};

module.exports = {
  getAll,
};
