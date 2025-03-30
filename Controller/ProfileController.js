const User = require("../Models/UserModel");
const fs = require("fs");
const path = require("path");

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      " displayName username bio profilePicture interests followers following posts"
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      displayName: user.displayName,
      username: user.username,
      bio: user.bio,
      profilePicture: user.profilePicture || "https://via.placeholder.com/150",
      interests: user.interests || [],
      followers: Array.isArray(user.followers) ? user.followers.length : 0,
      following: Array.isArray(user.following) ? user.following.length : 0,
      // followers: user.followers.length,
      // following: user.following.length,
      posts: user.post || 0,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch the profile",
      details: error.message,
    });
  }
};

// No Authentication required
const getPublicProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "username bio profilePicture followers following"
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch the profile",
      details: error.message,
    });
  }
};

// Update profile (authenticated user)
// const updateProfile = async (req, res) => {
//   try {
//     const { username, bio, interests } = req.body;
//     const updateFields = { username, bio };

//     if (interests) {
//       updateFields.interests = Array.isArray(interests)
//         ? interests
//         : JSON.parse(interests);
//     }

//     const user = await User.findByIdAndUpdate(req.params.id, updateFields, {
//       new: true,
//       runValidators: true,
//     });

//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     res.status(200).json({
//       message: "Profile updated successfully",
//       user,
//     });
//   } catch (error) {
//     res.status(500).json({
//       error: "Failed to update profile",
//       details: error.message,
//     });
//   }
// };

const updateProfile = async (req, res) => {
  try {
    console.log("🛠️ Received update request at /profile/:id");
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);

    const { username, bio, interests } = req.body;
    const updateFields = { username, bio };

    if (interests) {
      updateFields.interests = Array.isArray(interests)
        ? interests
        : JSON.parse(interests);
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      console.log("🚨 User not found.");
      return res.status(404).json({ error: "User not found" });
    }

    console.log("✅ Profile details updated successfully:", user);
    res.status(200).json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("🚨 Error updating profile:", error.message);
    res.status(500).json({
      error: "Failed to update profile",
      details: error.message,
    });
  }
};

// Update profile picture
const updateProfilePicture = async (req, res) => {
  try {
    console.log("🔹 Request received at /profile-picture");
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);
    console.log("File:", req.file);

    const userId = req.params.id;

    if (!req.file) {
      console.error("🚨 No file received in request.");
      return res.status(400).json({
        error: "No file uploaded. Ensure the field name is 'profilePicture'.",
      });
    }

    const profilePicturePath = `/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      userId,
      { profilePicture: profilePicturePath },
      { new: true, runValidators: true }
    );

    if (!user) {
      console.error("🚨 User not found.");
      return res.status(404).json({ error: "User not found" });
    }

    console.log("✅ Profile picture updated successfully!");
    res.status(200).json({
      message: "Profile picture updated successfully",
      profilePicture: user.profilePicture,
    });
  } catch (error) {
    console.error("🚨 Error uploading profile picture:", error);
    res.status(500).json({
      error: "Failed to update profile picture",
      details: error.message,
    });
  }
};

// Get followers
const getFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate(
      "followers",
      "username profilePicture"
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      count: user.followers.length,
      followers: user.followers,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch followers",
      details: error.message,
    });
  }
};

// Get following
const getFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate(
      "following",
      "username profilePicture"
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      count: user.following.length,
      following: user.following,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch following",
      details: error.message,
    });
  }
};

// Follow a user
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
      await user.save();
      await currentUser.save();
    }

    res.status(200).json({ message: "Followed user successfully" });
  } catch (error) {
    res.status(500).json({
      error: "Failed to follow user",
      details: error.message,
    });
  }
};

// Unfollow a user
const unfollowUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!user || !currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    user.followers = user.followers.filter(
      (id) => id.toString() !== req.user.id
    );
    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== req.params.id
    );

    await user.save();
    await currentUser.save();

    res.status(200).json({ message: "Unfollowed user successfully" });
  } catch (error) {
    res.status(500).json({
      error: "Failed to unfollow user",
      details: error.message,
    });
  }
};

// Increment post count
const incrementPostCount = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.posts = (user.posts || 0) + 1;
    await user.save();

    res.status(200).json({
      message: "Post count incremented",
      posts: user.posts,
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to increment post count",
      details: error.message,
    });
  }
};

const searchUser = async (req, res) => {
  const query = req.query.q?.trim(); //optional chaning to acesst the property safely 
  if (!query) return res.status(400).json({ message: "Search query is required" })

  try {
    const user = await User.find({
      $or: [
        { name: { $regex: query, $options: "1" } },
        { username: { $regex: query, $options: "1" } }
      ],
    }).select("-password -email -__v")
    res.status(200).json(users);
  } catch (error) {
    console.error("Search error: ", error.message);
    res.status(500).json({ message: "Internal server error" })
  }
}

module.exports = {
  getProfile,
  getPublicProfile,
  getFollowers,
  getFollowing,
  updateProfile,
  updateProfilePicture,
  incrementPostCount,
  followUser,
  unfollowUser,
  searchUser
};
