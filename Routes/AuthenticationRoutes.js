const express = require("express");

const { auth } = require("../Middleware/Authentication");

const {
  signup,
  login,
  logout,
  forgotPassword,
  resetPassword
} = require("../Controller/AuthenticationController");

const router = express.Router();

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/logout").post(auth, logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
module.exports = router;
