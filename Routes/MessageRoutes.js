const express = require("express");
const {
    sendMessage,
    getMessage,
    getConversation,
    getOrCreate,
    getUnreadCount
} = require("../Controller/MesssageController");
const { auth } = require("../Middleware/Authentication");


const router = express.Router();

// Messages routes remain unchanged.
router.route("/messages").post(auth, sendMessage);
router.route("/messages").get(getMessage);

// For conversations, we use the auth middleware and expect a query parameter "userId"
// to filter the conversations to only those that involve the logged-in user.
router.route("/conversations").get(auth, getConversation);

// The getOrCreate endpoint can also be protected by authMiddleware.
router.route("/conversations/getOrCreate").post(auth, getOrCreate);
router.route("/unread").get(auth, getUnreadCount)

module.exports = router;
