const express = require("express");
const {
  getProfile,
  getFollower,
  getFollowing,
  updateProfile,
  incrementPostCount,
} = require("../Controllers/ProfileController");
const auth = require("../Middleware/Authentication");

const router = express.Router();

router.route("/:id").get(getProfile);
router.route("/:id").put(auth, updateProfile);
router.route("/:id/followers").get(auth, getFollower);
router.route("/:id/following").get(auth, getFollowing);

module.exports = router;
