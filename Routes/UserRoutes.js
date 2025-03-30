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
  searchUser,
} = require("../Controller/ProfileController");
const { auth } = require("../Middleware/Authentication");
const { uploadSingle } = require("../Middleware/Upload");
const { getUserPosts } = require("../Controller/PostController");
const router = express.Router();

router.get("/search", searchUser)
router.get("/:id/posts", auth, getUserPosts);

router.get("/:id", auth, getProfile);
router.get("/:id/public", getPublicProfile);
router.put("/:id", auth, updateProfile);
router.put(
  "/:id/profile-picture",
  auth,
  uploadSingle,
  updateProfilePicture
);
router.get("/:id/followers", auth, getFollowers);
router.get("/:id/following", auth, getFollowing);
router.put("/:id/follow", auth, followUser);
router.put("/:id/unfollow", auth, unfollowUser);
router.put("/:id/increment-post", auth, incrementPostCount);


module.exports = router;
