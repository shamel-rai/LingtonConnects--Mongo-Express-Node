const express = require("express");
const auth = require("../Middleware/Authentication");
const {
  getPost,
  addpost,
  like,
  comment,
  share,
} = require("../Controllers/PostController");
const { getUserPost } = require("../Controller/PostController");

const router = express.Router();

router.route("/posts").post(auth, addpost);
router.route("/posts").get(auth, getPost);
routter.route("/posts/:id").get(auth, getUserPost);
router.route("/post/:id/like", auth, like);
router.route("/posts/:id/comment", auth, comment);
router.route("/posts/:id/share", auth, share);
module.exports = router;
