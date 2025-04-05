const Message = require("../Models/Message");
const Conversation = require("../Models/Conversation");
const socketService = require("../services/socketServices");

exports.sendMessage = async (req, res) => {
    try {
        const { conversationId, text } = req.body;
        if (!conversationId || !text || !req.user) {
            return res.status(400).json({ error: "Conversation ID, text, and authenticated user are required" });
        }

        // Use dynamic data from req.user (ensure req.user.avatar is set)
        const sender = {
            _id: req.user.id,
            name: req.user.name || `User ${req.user.id}`,
            avatar: req.user.avatar || "https://via.placeholder.com/50", // default fallback
        };

        const newMessage = new Message({
            conversationId,
            text,
            sender,
            timestamp: new Date(),
            read: false,
        });
        await newMessage.save();

        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: {
                text,
                timestamp: newMessage.timestamp,
                sender: sender,
            },
            read: false,
        });

        socketService.emitNewMessage(conversationId, newMessage);
        res.status(201).json(newMessage);
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ error: "Server Error" });
    }
};

exports.getMessage = async (req, res) => {
    try {
        const { conversationId } = req.query;
        if (!conversationId) {
            return res.status(400).json({ error: "Conversation ID is required" });
        }

        const messages = await Message.find({ conversationId }).sort({ timestamp: 1 });
        res.status(200).json(messages);
    } catch (error) {
        console.error("Error getting the message: ", error);
        res.status(500).json({ error: "Server error" });
    }
};
// UPDATED: Get all conversations and populate the user data (username & avatar)
exports.getConversation = async (req, res) => {
    try {
        // Prefer the authenticated user's id from req.user
        const currentUserId = req.user && req.user.id ? req.user.id : req.query.userId;
        if (!currentUserId) {
            return res.status(400).json({ error: "User ID is required" });
        }
        // Find conversations where the current user is a participant.
        const conversations = await Conversation.find({ users: currentUserId })
            .populate("users", "username avatar");
        res.status(200).json(conversations);
    } catch (error) {
        console.error("Error fetching conversation:", error);
        res.status(500).json({ error: "Server error" });
    }
};

// UPDATED: Get or create a conversation and return it with populated user data
exports.getOrCreate = async (req, res) => {
    try {
        // Assuming req.user is set by auth middleware
        const { user1, user2 } = req.body;
        if (!user1 || !user2) {
            return res.status(400).json({ error: "Both user1 and user2 are required" });
        }
        let conversation = await Conversation.findOne({
            users: { $all: [user1, user2] },
        }).populate("users", "username avatar");
        if (!conversation) {
            conversation = new Conversation({
                users: [user1, user2],
                read: false,
            });
            await conversation.save();
            conversation = await Conversation.findById(conversation._id)
                .populate("users", "username avatar");
        }
        res.status(200).json(conversation);
    } catch (error) {
        console.error("Error in getOrCreate conversation:", error);
        res.status(500).json({ error: "Server error" });
    }
};
