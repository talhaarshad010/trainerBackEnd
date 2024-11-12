const jwt = require("jsonwebtoken");

const checkAuth = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1]; // Extract token from Authorization header

  if (!token) {
    return res.status(401).json({ status: false, error: "No token provided" });
  }

  jwt.verify(token, process.env.TOKEN_KEY, (err, decoded) => {
    if (err) {
      return res
        .status(403)
        .json({ status: false, error: "Failed to authenticate token" });
    }

    req.userId = decoded.id;
    next(); // Proceed to the next middleware or route handler
  });
};

module.exports = checkAuth;
