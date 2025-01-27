const express = require("express");

const { auth } = require("../Middleware/Authentication");

const {
  signup,
  login,
  logout,
} = require("../Controller/AuthenticationController");

const router = express.Router();

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/logout").post(auth, logout);
module.exports = router;
