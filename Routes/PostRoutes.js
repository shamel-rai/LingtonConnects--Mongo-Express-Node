const express = require("express");
const { auth } = require("../Middleware/Authentication");
const {
  addpost,
  getAllPost,
  getPost,
  like,
  comment,
  share,
  deletePost
} = require("../Controller/PostController");

const { uploadMultiple } = require("../Middleware/Upload");

const router = express.Router();

router.route("/posts").post(auth, uploadMultiple, addpost);

router.route("/posts/all").get(auth, getAllPost);

router.route("/posts/home-feed").get(auth, getPost);

router.route("/posts/:id/like").post(auth, like);

router.route("/posts/:id/comment").post(auth, comment);

router.route("/posts/:id/share").post(auth, share);

router.route("/posts/:id").post(auth, deletePost);

module.exports = router;
