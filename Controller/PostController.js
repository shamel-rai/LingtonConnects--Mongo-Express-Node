const Post = require("../Models/PostModel");
const User = require("../Models/UserModel");

//Create post
exports.addpost = async (req, res) => {
  try {
    const { content, location, tags } = req.body;
    const userId = req.user.id;

    if (!content && (!req.files || req.files.length === 0)) {
      return res.status(400).json({ message: "Post must have a content or media" })

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
      tags: taggedUsers
    })

    await newPost.save()
    res.status(201).json({ message: "Post Created Successfully: ", post: newPost });


  }
  catch (error) {
    console.error("Error creating post: ", error);
    res.status(500).json({ message: "Erroer creating post: ", error: error.message })
  };
}

//getallpost (even if user follows or does not follow)
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

//get post
exports.getPost = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate("following", "id");

    if (!user) {
      return res.status(404).json({ message: "User not Found" });
    }
    const followedUser = user.following.map((f) => f.id);

    const post = await Post.find({ user: { $in: followedUser } })
      .populate("user", "username profilepicture, fullname")
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

//Like
exports.like = async (req, res) => {
  try {
    const userId = req.user.id;
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.likedBy.includes(userId)) {
      post.likedBy.pull(userId);
      post.likes -= 1;
    } else {
      post.likedBy.push(userId);
      post.likes += 1;
    }

    await post.save();
    res.status(200).json({ message: "Post liked/unliked", post });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//Comments
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
      content, // Ensure this is a string from the frontend
      time: new Date(),
    };

    post.comments.push(newComment);
    await post.save();

    // Populate the user details for the comments
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

//share
exports.share = async (req, res) => {
  try {
    const userId = req.user.id;
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ message: "post not found" });

    post.shares += 1;
    await post.save();

    res.status(200).json({ message: "Post shared", post });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const postId = req.params.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Checking if the user is the post owner
    if (post.user.toString() != userId) {
      return res.status(401).json({ message: "Unauthorized: You cannot delete the post" });
    }

    // Delete associated media files
    if (post.media && post.media.length > 0) {
      // Option 1: Sequential deletion
      for (const filePath of post.media) {
        const fullFilePath = path.join(__dirname, "..", filePath);
        try {
          await fs.promises.unlink(fullFilePath);
          console.log(`Deleted file: ${fullFilePath}`);
        } catch (error) {
          console.error(`Error deleting file ${fullFilePath}:`, error);
        }
      }

      // Option 2: Concurrent deletion (uncomment to use)
      /*
      await Promise.all(post.media.map(async (filePath) => {
        const fullFilePath = path.join(__dirname, "..", filePath);
        try {
          await fs.promises.unlink(fullFilePath);
          console.log(`Deleted file: ${fullFilePath}`);
        } catch (error) {
          console.error(`Error deleting file ${fullFilePath}:`, error);
        }
      }));
      */
    }

    // Delete the post from the database
    await Post.findByIdAndDelete(postId);

    res.status(200).json({ message: "Post and associated media deleted successfully" });
  } catch (error) {
    console.error("Error deleting the post:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


exports.getComments = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("comments.user", "username profilePicture displayName"); // Notice "comments.user"
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.status(200).json({ comments: post.comments }); // Return as "comments"
  } catch (error) {
    console.error("Error in getComments:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};



exports.updateComments = async (req, res) => {
  const { postId, commentId } = req.params;
  const { content } = req.body;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Find the comment index by matching the commentId
    const commentIndex = post.comments.findIndex(
      (c) => c._id.toString() === commentId
    );
    if (commentIndex === -1) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Update the comment's content and optionally its timestamp
    post.comments[commentIndex].content = content;
    post.comments[commentIndex].time = new Date();
    await post.save();

    //  Populate comment user details if needed
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

exports.delComments = async (req, res) => {
  const { postId, commentId } = req.params;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Filter out the comment to be deleted
    post.comments = post.comments.filter(
      (c) => c._id.toString() !== commentId
    );

    await post.save();

    // populate comment user details if needed
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