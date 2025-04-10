// controllers/PostController.js

const Post = require("../Models/PostModel");
const User = require("../Models/UserModel");
const path = require("path");
const fs = require("fs");

// Imports for notifications
const Notification = require("../Models/NotificationModel");
const { sendNotifications } = require("../services/notificationService");
const tokenModel = require("../Models/tokenModels");

/**
 * Create post
 */
exports.addpost = async (req, res) => {
  try {
    const { content, location, tags } = req.body;
    const userId = req.user.id;

    if (!content && (!req.files || req.files.length === 0)) {
      return res.status(400).json({ message: "Post must have a content or media" });
    }

    let media = [];
    if (req.files && req.files.length > 0) {
      media = req.files.map((file) => {
        // Convert absolute path to a relative path for storage
        return `uploads/${file.filename}`;
      });
    }
    let taggedUsers = [];
    if (tags && tags.length > 0) {
      const foundUsers = await User.find({ _id: { $in: tags } }).select("_id");
      taggedUsers = foundUsers.map(user => user._id);
    }

    const newPost = new Post({
      user: userId,
      content,
      media,
      location,
      tags: taggedUsers,
    });

    await newPost.save();
    res.status(201).json({ message: "Post Created Successfully", post: newPost });
  } catch (error) {
    console.error("Error creating post: ", error);
    res.status(500).json({ message: "Error creating post", error: error.message });
  }
};

/**
 * Get all posts
 */
exports.getAllPost = async (req, res) => {
  try {
    const posts = await Post.find({})
      .populate("user", "username profilePicture fullname")
      .populate("tags", "username")
      .populate({
        path: "comments.user",
        select: "username profilePicture fullname"
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ message: "All Post", posts });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/**
 * Get posts from users that the current user follows
 */
exports.getPost = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate("following", "id");

    if (!user) {
      return res.status(404).json({ message: "User not Found" });
    }
    const followedUser = user.following.map((f) => f.id);

    const post = await Post.find({ user: { $in: followedUser } })
      .populate("user", "username profilepicture fullname")
      .populate("tags", "username")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Home Feed",
      post,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Like / Unlike a post
 */
exports.like = async (req, res) => {
  try {
    const userId = req.user.id;
    // Populate "user" to have the post owner details.
    const post = await Post.findById(req.params.id).populate("user");
    if (!post) return res.status(404).json({ message: "Post not found" });

    let action = "";
    if (post.likedBy.includes(userId)) {
      // Unlike the post
      post.likedBy.pull(userId);
      post.likes -= 1;
      action = "unlike";
    } else {
      // Like the post
      post.likedBy.push(userId);
      post.likes += 1;
      action = "like";
    }

    await post.save();

    // Create and emit notification only if it's a new like
    if (action === "like" && post.user) {
      try {
        // Create notification in DB
        const newNotification = await Notification.create({
          type: "like",
          senderId: userId,
          receiverId: post.user._id,  // post owner's id
          postId: post._id,
          message: "Someone liked your post!",
        });

        // Optionally send push notifications (to all tokens in memory for demo)
        const tokens = tokenModel.getTokens();
        if (tokens.length > 0) {
          await sendNotifications(tokens, "New Like!", "Someone liked your post!");
        }

        // Emit the notification live using Socket.IO
        socketService.emitNotification(post.user._id, newNotification);
      } catch (notifyError) {
        console.error("Notification error in like:", notifyError);
      }
    }

    res.status(200).json({ message: "Post liked/unliked", post });
  } catch (error) {
    console.error("Error liking post:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
/**
 * Comment on a post
 */
exports.comment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Comment content is required" });
    }

    const post = await Post.findById(req.params.id)
      .populate("user", "username displayName profilePicture");
    if (!post) return res.status(404).json({ message: "Post not found" });

    const newComment = {
      user: userId,
      content,
      time: new Date(),
    };

    post.comments.push(newComment);
    await post.save();

    // Create notification for the post owner about the comment
    try {
      const newNotification = await Notification.create({
        type: "comment",
        senderId: userId,
        receiverId: post.user._id,
        postId: post._id,
        message: "Someone commented on your post!",
      });

      const tokens = tokenModel.getTokens();
      if (tokens.length > 0) {
        await sendNotifications(tokens, "New Comment!", "Someone commented on your post.");
      }

      // Emit real-time notification
      socketService.emitNotification(post.user._id, newNotification);
    } catch (notifyError) {
      console.error("Notification error in comment:", notifyError);
    }

    // Optionally populate comment user details for response
    await post.populate({
      path: "comments.user",
      select: "username profilePicture displayName",
    });

    res.status(200).json({ message: "Comment added", post });
  } catch (error) {
    console.error("Error in comment controller:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/**
 * Share a post
 */
exports.share = async (req, res) => {
  try {
    const userId = req.user.id;
    const post = await Post.findById(req.params.id).populate("user");
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.shares += 1;
    await post.save();

    // Create notification for sharing
    try {
      const newNotification = await Notification.create({
        type: "share",
        senderId: userId,
        receiverId: post.user._id,
        postId: post._id,
        message: "Someone shared your post!",
      });

      const tokens = tokenModel.getTokens();
      if (tokens.length > 0) {
        await sendNotifications(tokens, "New Share!", "Someone shared your post.");
      }

      // Emit real-time notification
      socketService.emitNotification(post.user._id, newNotification);
    } catch (notifyError) {
      console.error("Notification error in share:", notifyError);
    }

    res.status(200).json({ message: "Post shared", post });
  } catch (error) {
    console.error("Error sharing post:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
/**
 * Delete a post
 */
exports.deletePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const postId = req.params.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if the user is the owner of the post
    if (post.user.toString() !== userId) {
      return res.status(401).json({ message: "Unauthorized: You cannot delete this post" });
    }

    // Delete associated media files if any
    if (post.media && post.media.length > 0) {
      for (const filePath of post.media) {
        const fullFilePath = path.join(__dirname, "..", filePath);
        try {
          await fs.promises.unlink(fullFilePath);
          console.log(`Deleted file: ${fullFilePath}`);
        } catch (error) {
          console.error(`Error deleting file ${fullFilePath}:`, error);
        }
      }
    }

    // Delete post from database
    await Post.findByIdAndDelete(postId);
    res.status(200).json({ message: "Post and associated media deleted successfully" });
  } catch (error) {
    console.error("Error deleting the post:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Get comments on a post
 */
exports.getComments = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("comments.user", "username profilePicture displayName");
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.status(200).json({ comments: post.comments });
  } catch (error) {
    console.error("Error in getComments:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/**
 * Update a comment on a post
 */
exports.updateComments = async (req, res) => {
  const { postId, commentId } = req.params;
  const { content } = req.body;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const commentIndex = post.comments.findIndex(
      (c) => c._id.toString() === commentId
    );
    if (commentIndex === -1) {
      return res.status(404).json({ message: "Comment not found" });
    }

    post.comments[commentIndex].content = content;
    post.comments[commentIndex].time = new Date();
    await post.save();

    await post.populate("comments.user", "username profilePicture displayName");

    return res.status(200).json({
      message: "Comment updated successfully",
      post,
    });
  } catch (error) {
    console.error("Error updating comment:", error);
    return res.status(500).json({ error: "Unable to update comment" });
  }
};

/**
 * Delete a comment on a post
 */
exports.delComments = async (req, res) => {
  const { postId, commentId } = req.params;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.comments = post.comments.filter(
      (c) => c._id.toString() !== commentId
    );

    await post.save();
    await post.populate("comments.user", "username profilePicture displayName");

    return res.status(200).json({
      message: "Comment deleted successfully",
      post,
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return res.status(500).json({ error: "Unable to delete comment" });
  }
};

/**
 * Get posts by a specific user
 */
exports.getUserPosts = async (req, res) => {
  try {
    const userId = req.params.id;
    const posts = await Post.find({ user: userId })
      .populate("user", "username profilePicture displayName")
      .populate("comments.user", "username profilePicture displayName")
      .sort({ createdAt: -1 });
    return res.status(200).json({
      message: `Posts for user ${userId}`,
      posts,
    });
  } catch (error) {
    console.error("Error fetching user posts:", error);
    return res.status(500).json({
      message: "Error fetching user posts",
      error: error.message,
    });
  }
};
