const User = require("../Models/UserModel");

exports.getHomepage = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (user) {
      res.json({
        message: "Welcome to home page",
        user: {
          id: user._id,
          username: user.username,
          profilePicture: user.profilePicture,
          fullname: user.fullname,
          follower: user.follower,
          following: user.following,
          post: user.post,
        },
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
