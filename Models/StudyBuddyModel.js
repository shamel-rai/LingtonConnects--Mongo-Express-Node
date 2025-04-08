const mongoose = require("mongoose");

const studyBuddySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    course: {
        type: String,
        default: ""
    },
    interest: {
        type: String,
        required: true
    },
    bio: {
        type: String,
        default: ""
    },
    availability: {
        type: String,
        default: ""
    },
    connected: {
        type: Boolean,
        default: false
    },
    profilePicture: {         // <-- NEW FIELD ADDED
        type: String,
        default: ""
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });

const StudyBuddy = mongoose.model("StudyBuddy", studyBuddySchema);
module.exports = StudyBuddy;
