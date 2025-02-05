const Post = require("../Models/PostModel");
const User = require("../Models/UserModel");

//Create post
exports.addpost = async (req, res) => {
  try {
    const { content, location, tags } = req.body;
    const userId = req.user.id;

    let media = [];
    if (!req.body) {
      media = req.files.map((file) => file.path); // will store media path
    }

    const taggedUser = tags
      ? await User.find({ username: { $in: tags } }).select("_id")
      : [];

    const newPost = new Post({
      user: userId,
      content,
      media,
      location,
      tags: taggedUser.map((user) => user._id),
    });

    await newPost.save();

    res
      .status(201)
      .json({ message: "Post created successfully!", post: newPost });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating Post", error: error.message });
  }
};

//getallpost (even if user follows or does not follow)
exports.getAllPost = async (req, res) => {
  try {
    const posts = await Post.find({})
      .populate("user", "username profilePicture fullname")
      .populate("tags", "username")
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
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ messsage: " Post not found" });

    const newComment = {
      user: userId,
      content,
      time: new Date(),
    };

    post.comments.push(newComment);
    await post.save();

    res.status(200).json({ message: "Comment added", post });
  } catch (error) {
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
