const jwt = require("jsonwebtoken");

const verifyToken = async (req, res, next) => {
  const token = !!req?.headers["authorization"]
    ? req?.headers["authorization"].split(" ")[1]
    : null;

  console.log("AUTH_Token", token);

  if (!token) {
    res.status(401).json({
      status: false,
      error: "token is required",
      message: "A token is required for authentication",
    });
  }

  try {
    const decode = jwt.verify(token, process.env.TOKEN_KEY);
    req.user = decode;
    console.log("AUTH_Token", req.user);
  } catch (error) {
    res.status(401).json({
      status: false,
      message: "Token is not valid",
      error: error,
    });
  }
  next();
};
module.exports = verifyToken;
