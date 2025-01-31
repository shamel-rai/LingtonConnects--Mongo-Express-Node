// auth.js

const jwt = require("jsonwebtoken");
const Blacklist = require("../Models/TokenModel");

const auth = async (req, res, next) => {
  try {
    // 1) Make sure Authorization header exists and starts with "Bearer "
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Please log in to get access" });
    }

    // 2) Extract the token from the header
    const token = authHeader.split(" ")[1];

    // 3) Check if this token is blacklisted
    const isBlacklisted = await Blacklist.findOne({ token });
    if (isBlacklisted) {
      return res.status(401).json({ message: "Token has been logged out" });
    }

    // 4) Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach the decoded token payload to req.user
    next();
  } catch (error) {
    // 5) Catch token expiration or invalid token errors
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired" });
    }
    return res
      .status(401)
      .json({ message: "Invalid token or authorization error" });
  }
};

module.exports = { auth };
