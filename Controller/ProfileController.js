const User = require("../Models/UserModel");

const getProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select(
      "fullName profilePicture username email followers following post bio"
    );

    if (!user) {
      return res.status(404).json({ message: "User Not found" });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user profile" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { username, bio, interest } = req.body;
    const { id } = req.params.id;

    let profilePicture = req.file
      ? `http://localhost:3001/Uploads/${req.file.filename}`
      : undefined;

    const user = await User.findByIdAndUpdate(
      id,
      {
        username,
        bio,
        interest: interest ? JSON.parse(interest) : [],
        profilePicture,
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({
      message: "Profile updated Successfully",
      user: {
        username: user.username,
        bio: user.bio,
        profilePicture: user.profilePicture,
        interest: user.interest,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update the profile " });
  }
};

const getFollower = async (req, res) => {
  try {
    const getFollower = await User.findById(req.params.id).populate(
      "followers",
      "profilePicture fullName"
    );
    if (!getFollower) {
      return res.status(404).json({
        status: "Failed",
        message: "User not found",
      });
    }
    res.status(200).json({
      status: "Success",
      follwers: getFollower.follwers,
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: `Server Error ${error.message}`,
    });
  }
};

const getFollowing = async (req, res) => {
  try {
    const getFollowing = await User.findById(req.params.id).populate(
      "following",
      "profilePicture fullName"
    );
    if (!getFollwering) {
      return res.status(404).json({
        status: "Failed",
        message: "Users not Found",
      });
    }
    res.status(200).json({
      status: "Success",
      following: getFollowing.following,
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: `Server Error ${error.message}`,
    });
  }
};

const incrementPostCount = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({
        status: "Failed",
        message: "User ID is required",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { post: 1 } },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({
        status: "Failed",
        message: "User not Found",
      });
    }
    res.status(200).json({
      status: "Success",
      postCount: user.post,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getFollower,
  getFollowing,
  incrementPostCount,
};
