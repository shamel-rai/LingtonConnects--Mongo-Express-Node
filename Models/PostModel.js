const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: false,
    },
    media: [
      {
        type: String, // Supports multiple images/videos
      },
    ],
    likes: {
      type: Number,
      default: 0,
    },
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        time: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    shares: {
      type: Number,
      default: 0,
    },
    isShared: {
      type: Boolean,
      default: false
    },
    originalPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post"
    },
  },
  { timestamps: true } // Enables `createdAt` and `updatedAt` automatically
);

const Post = mongoose.model("Post", postSchema);
module.exports = Post;
