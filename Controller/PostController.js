const Post = require("../Models/PostModel");

//Create post
const addpost = async (req, res) => {
  const { content, image } = req.body;

  if (!content) {
    return res.status(400).json({ message: "Content is required" });
  }

  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: "Unauthoriz" });
  }
  try {
    const newPost = new Post({
      user: req.user.id,
      content,
      image: image || "",
    });
    await newPost.save();
    res.status(201).json({
      message: "Post created successfully",
      post: newPost,
    });
  } catch (error) {
    res.status(500).json({ message: "Sever error", error });
  }
};

//getAll post
const getPost = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ time: -1 })
      .populate("user", "fullname username profilePicture")
      .populate("comments.user", "fullname username profilePicture");
    res.status(200).json({
      status: "Success",
      posts,
    });
  } catch (error) {
    res.status(500).json({ message: "Sever error", error });
  }
};

//Get userPost
const getUserPost = async (req, res) => {
  const { userId } = req.params;
  try {
    const post = await User.find({ user: userId })
      .sort({ time: -1 })
      .populate("user", "fullname username profilePicture")
      .populate("comments.user", "fullname username profilePicture");
    res.status(200).json({ status: "Success", post });
  } catch (error) {
    res.status(500).status({ message: "Server Error", error });
  }
};

const like = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const index = post.likedBy.indexOf(userId);
    if (index === -1) {
      post.likedBy.push(userID);
      post.likes += 1;
    } else {
      post.likedBy.splice(index, 1);
      post.likes -= 1;
    }
    await post.save();
    res.status(200).json({
      message: "Post like status successfully",
      post,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error,
    });
  }
};

const comment = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({
      message: "Comment content is required",
    });
  }

  try {
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }
    const newComment = {
      user: req.user.id,
      content,
    };
    post.comments.push(newComment);
    await post.save();

    await post.populate("comments.user", " fullname username profilePicture");

    res.status(201).json({
      message: "Comment added succesfully",
      post,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error,
    });
  }
};

const share = async (req, res) => {
  const { id } = req.params;
  try {
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    post.shares += 1;
    await post.save();
    res.status(200).json({
      message: "Post shared successfully",
      post,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error,
    });
  }
};

module.exports = {
  addpost,
  getPost,
  like,
  getUserPost,
  comment,
  share,
};
