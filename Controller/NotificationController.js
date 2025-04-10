// controllers/NotificationController.js
const tokenModel = require("../Models/tokenModels");
const Notification = require("../Models/NotificationModel");
const { sendNotifications, sendPushToToken } = require("../services/notificationService");
const socketService = require("../services/socketServices");

/**
 * Register a device token
 */
exports.registerToken = (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.status(400).json({ success: false, message: "Token is required" });
    }
    tokenModel.addToken(token);
    return res.status(200).json({ success: true, message: "Token registered successfully" });
};

/**
 * List all tokens (for debugging/testing)
 */
exports.listTokens = (req, res) => {
    const tokens = tokenModel.getTokens();
    return res.status(200).json(tokens);
};

/**
 * Send notification to all tokens
 */
exports.sendNotification = async (req, res) => {
    try {
        const { title, body } = req.body;
        const tokens = tokenModel.getTokens();
        const response = await sendNotifications(tokens, title, body);
        return res.status(200).json({
            success: true,
            message: "Notifications sent",
            response,
        });
    } catch (error) {
        console.error("Error sending notification:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Send notification to a single token
 */
exports.sendNotificationToToken = async (req, res) => {
    const { token, title, body } = req.body;
    if (!token) {
        return res.status(400).json({ success: false, message: "Token is required" });
    }
    try {
        const response = await sendPushToToken(token, title, body);
        return res.status(200).json({
            success: true,
            message: "Notification sent to token successfully",
            response,
        });
    } catch (error) {
        console.error("Error sending notification:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Create a dynamic notification in DB (and send a push)
 */
exports.createNotification = async (req, res) => {
    try {
        const { type, senderId, receiverId, postId, message } = req.body;

        // 1) Create the notification in MongoDB
        const newNotification = await Notification.create({
            type,
            senderId,
            receiverId,
            postId,
            message,
        });

        // 2) Optionally send push notification (Firebase)
        const tokens = tokenModel.getTokens(); // in-memory
        await sendNotifications(tokens, "You have a new notification!", message || "Check it out!");

        // 3) **Emit** the Socket.IO event
        socketService.emitNotification(receiverId, newNotification);

        return res.status(201).json({
            success: true,
            notification: newNotification,
            message: "Notification created + push + socket event!",
        });
    } catch (error) {
        console.error("Error creating notification:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
};
/**
 * Get all notifications for a user
 */
exports.getNotificationsForUser = async (req, res) => {
    try {
        const { userId } = req.params;

        // Query the notifications for this user
        const notifications = await Notification.find({ receiverId: userId })
            .populate("senderId", "username profilePicture") // populate 'username' & 'profilePicture'
            .populate("postId", "content") // optional, if you want post content
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            notifications,
        });
    } catch (err) {
        console.error("Error fetching notifications:", err);
        return res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * Mark a single notification as read
 */
exports.markNotificationAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const notification = await Notification.findByIdAndUpdate(
            notificationId,
            { read: true },
            { new: true }
        );
        if (!notification) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }
        return res.status(200).json({ success: true, notification });
    } catch (err) {
        console.error("Error marking notification as read:", err);
        return res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * Mark all notifications as read for a user
 */
exports.markAllNotificationsAsRead = async (req, res) => {
    try {
        const { userId } = req.params;
        await Notification.updateMany({ receiverId: userId }, { read: true });
        return res.status(200).json({
            success: true,
            message: "All notifications marked as read",
        });
    } catch (err) {
        console.error("Error marking all as read:", err);
        return res.status(500).json({ success: false, error: err.message });
    }
};
