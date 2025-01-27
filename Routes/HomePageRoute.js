const express = require("express");
const { auth } = require("../Middleware/Authentication");
const { getHomepage } = require("../Controller/HomeController");

const router = express.Router();

router.route("/homepage").get(auth, getHomepage);

module.exports = router;
