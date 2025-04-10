// routes/NotificationRoutes.js
const express = require("express");
const {
    registerToken,
    listTokens,
    sendNotification,
    sendNotificationToToken,
    createNotification,
    getNotificationsForUser,
    markNotificationAsRead,
    markAllNotificationsAsRead,
} = require("../Controller/NotificationController");

const router = express.Router();

// Existing token endpoints
router.post("/register-token", registerToken);
router.get("/tokens", listTokens);
router.post("/send-token", sendNotificationToToken);
router.post("/send-notification", sendNotification);

// Dynamic notifications endpoints
router.post("/notifications", createNotification); // Create notification
router.get("/notifications/:userId", getNotificationsForUser); // Get all for user
router.patch("/notifications/:notificationId/read", markNotificationAsRead); // Mark single as read
router.patch("/notifications/:userId/read-all", markAllNotificationsAsRead); // Mark all as read

module.exports = router;
