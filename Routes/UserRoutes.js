// Routes/UserRoutes.js

const express = require("express");
const {
  getProfile,
  getPublicProfile,
  getFollowers,
  getFollowing,
  updateProfile,
  updateProfilePicture,
  incrementPostCount,
  followUser,
  unfollowUser,
} = require("../Controller/ProfileController");

// We exported 'auth' as { auth } from Authentication.js
const { auth } = require("../Middleware/Authentication");

// We exported 'upload' as the default from Upload.js
// So we import it directly without curly braces
const upload = require("../Middleware/Upload");

const router = express.Router();

// Route to get a user's profile (requires authentication)
router.get("/:id", auth, getProfile);

// Route to get a public profile (no authentication needed)
router.get("/:id/public", getPublicProfile);

// Route to update a user's profile (requires authentication)
router.put("/:id", auth, updateProfile);

// Route to update profile picture (requires authentication & file upload middleware)
router.put(
  "/:id/profile-picture",
  auth,
  upload.single("profilePicture"), // ✅ Ensure the field name is "profilePicture"
  updateProfilePicture
);
// Routes to manage followers/following (requires authentication)
router.get("/:id/followers", auth, getFollowers);
router.get("/:id/following", auth, getFollowing);
router.put("/:id/follow", auth, followUser);
router.put("/:id/unfollow", auth, unfollowUser);

// Route to increment a user's post count (requires authentication)
router.put("/:id/increment-post", auth, incrementPostCount);

module.exports = router;
