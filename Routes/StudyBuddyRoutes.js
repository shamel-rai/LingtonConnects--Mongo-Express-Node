const express = require("express");
const { auth } = require("../Middleware/Authentication");
const { createStudyBuddy, getStudyBuddies, updateStudyBuddy, deleteStudyBuddy } = require("../Controller/StuddyController");


const router = express.Router();
router.route("/studybuddy").post(auth, createStudyBuddy);
router.route("/studybuddy").get(auth, getStudyBuddies);
router.route("/studybuddy/:id").put(auth, updateStudyBuddy);
router.route("/studybuddy/:id").delete(auth, deleteStudyBuddy);


module.exports = router