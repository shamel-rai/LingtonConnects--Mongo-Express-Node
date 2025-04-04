// Message.js
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation",
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    sender: {
        _id: {
            type: String, // Changed from ObjectId to String
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        avatar: {
            type: String,
            required: true,
        },
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    read: {
        type: Boolean,
        default: false,
    },
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
