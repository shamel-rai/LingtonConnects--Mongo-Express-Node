const User = require("../Models/UserModel");
const fs = require("fs");
const path = require("path");

//this is for authenticated purpose
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch the profile", details: error.message });
  }
};

//no Authentication required
const getPublicProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "username bio profilepicture followers following"
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch the profile", details: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { username, bio, interest } = req.body;
    const updateFields = { username, bio };
    if (interest) {
      updateFields.interest = JSON.parse(interest);
    }
    const user = await User.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({
      message: "Profile updated Successully",
      user,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to update profile", details: error.message });
  }
};

const updateProfilePicture = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!req.file) {
      return res.status(404).json({ error: "No file uploaded" });
    }

    const profilePicturePath = `/Uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      userId,
      { profilePicture: profilePicturePath },
      { new: true, runValidators: true }
    );
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({
      message: "Profile picture updated Sucessfully",
      profilePicture: user.profilePicture,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to updated profile picture",
      details: error.message,
    });
  }
};

// Followers
const getFollower = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate(
      "followers",
      "username profilePicture"
    );
    if (!user) {
      return res.status(404).json({ error: "User not found " });
    }
    res.status(200).json(user.followers);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch the user follwers",
      details: error.message,
    });
  }
};

//Following
const getFollowing = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId).populate(
      "following",
      "username profilePicture"
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user.following);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch user following",
      details: error.message,
    });
  }
};

// follow a user
const followUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!user || !currentUser) {
      return res.status(404).json({ error: "User not found" });
    }
    if (!user.followers.includes(req.user.id)) {
      user.followers.push(req.user.id);
      currentUser.following.push(req.params.id);
    }

    await user.save();
    await currentUser.save();
    res.status(200).json({ message: "Followed user Successfully " });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to follow user", details: error.message });
  }
};

//Unfollow
const unfollowUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!user || !currentUser) {
      return res.status(404).json({ error: "User not found" });
    }
    user.following = user.following.filter(
      (id) => id.toString() !== req.user.id
    );
    currentUser.following = currentUser.following(
      (id) => id.toString !== req.param.id
    );

    await user.save();
    await currentUser.save();

    res.status(200).json({ message: "User Unfollowed" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to unfollow user", details: error.message });
  }
};

const incrementPostCount = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.post = (user.post || 0) + 1;
    await User.save();
    res.status({ message: "Post count increament", post: user.post });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch post Count", details: error.message });
  }
};

module.exports = {
  getProfile,
  getPublicProfile,
  getFollower,
  getFollowing,
  updateProfile,
  updateProfilePicture,
  incrementPostCount,
  followUser,
  unfollowUser,
};
