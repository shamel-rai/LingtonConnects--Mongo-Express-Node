const mongoose = require("mongoose");


const conversationSchema = new mongoose.Schema({
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }],
    lastMessage: {
        text: String,
        timestamp: Date,
        isMine: Boolean
    },
    read: {
        type: Boolean,
        default: false
    }
});

const Conversation = mongoose.model("Conversation", conversationSchema);

module.exports = Conversation; 
