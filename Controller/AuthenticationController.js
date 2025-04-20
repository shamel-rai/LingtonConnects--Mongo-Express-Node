const User = require("../Models/UserModel");
const jwt = require("jsonwebtoken");
const Blacklist = require("../Models/TokenModel");
const crypto = require('crypto');


const secret = process.env.JWT_SECRET;

const signToken = (id) => {
  return jwt.sign({ id }, secret, { expiresIn: "7d" });
};

const tokenGen = (user, statusCode, res) => {
  const token = signToken(user._id);
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token: token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
};

exports.signup = async (req, res) => {
  const { fullName, username, email, password } = req.body;

  console.log("Incoming signup data: ", req.body);

  try {
    const allowedEmail = "@islingtoncollege.edu.np";
    if (!email.endsWith(allowedEmail)) {
      return res
        .status(400)
        .json({ message: "Please use your university email" });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "Email or user already exists" });
    }

    const newUser = new User({
      fullName,
      username,
      email,
      password,
      displayName: fullName,
    });

    await newUser.save();
    res.status(201).json({
      message: "Signup Succesful",
      user: newUser,
    });
  } catch (error) {
    console.error("Error during signup: ", error.message);

    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.login = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    if (!email && !username && !password) {
      return res
        .status(400)
        .json({ message: "Please provide email or username and password" });
    }

    const user = await User.findOne({
      $or: [{ username }, { email }],
    }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid Email or Password" });
    }
    tokenGen(user, 200, res);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message || error,
    });
  }
};

exports.logout = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "No token provided",
    });
  }

  try {
    const decoded = jwt.decode(token);
    const expiration = decoded?.exp;

    if (!expiration) {
      return res.status(400).json({ message: "Invalid Token" });
    }

    await Blacklist.create({
      token,
      expiredAt: new Date(expiration * 1000),
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
exports.forgotPassword = async (req, res) => {
  const { username } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(404).json({ message: "User not found" });

  const token = crypto.randomBytes(2).toString("hex");   // e.g. "3f8c"
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 10 * 60 * 1e3;
  await user.save();

  res.status(200).json({ resetCode: token, expiresIn: 600 });
};

exports.resetPassword = async (req, res) => {
  const { username, code, newPassword } = req.body;
  const user = await User.findOne({
    username,
    resetPasswordToken: code,
    resetPasswordExpires: { $gt: Date.now() }
  });
  if (!user) return res.status(400).json({ message: "Invalid or expired code" });

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.status(200).json({ message: "Password reset successful" });
};
