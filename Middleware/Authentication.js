const jwt = require("jsonwebtoken");
const Blacklist = require("../Models/TokenModel");

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.startsWith("Bearer")
      ? req.headers.authorization.split(" ")[1]
      : req.cookies?.jwt;

    if (!token) {
      return res.status(401).json({ message: "Please log in to get access" });
    }

    const isBlacklisted = await Blacklist.findOne({ token });
    if (isBlacklisted) {
      return res.status(401).json({ message: "Token has been logged out" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired" });
    }
    return res
      .status(401)
      .json({ message: "Invalid token or authorization error" });
  }
};

module.exports = { auth };
