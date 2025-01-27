const express = require("express");
const auth = require("../Middleware/Authentication");
const {
  getPost,
  addpost,
  like,
  comment,
  share,
} = require("../Controllers/PostController");

const router = express.Router();

router.route("/posts", auth, addpost);
router.route("/posts", getPost);
router.route("/posts/:id/like", like);
router.route("/posts/:id/comments", auth, comment);
router.route("/posts/:id/share", auth, share);

module.exports = router;
